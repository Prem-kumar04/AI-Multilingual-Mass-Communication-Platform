from typing import List, Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.core.security import decode_access_token
from app.database.session import get_db
from app.models.user import User, Role

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme),
) -> User:
    """Validate bearer token from Authorization header or cookie, and resolve current active User."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        token = request.cookies.get("access_token")

    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception
    user_id: Optional[str] = payload.get("sub")
    if not user_id:
        raise credentials_exception

    user = (
        db.query(User)
        .options(joinedload(User.roles).joinedload(Role.permissions))
        .filter(User.id == user_id)
        .first()
    )
    if not user:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated. Contact an Administrator.",
        )
    return user


class RoleChecker:
    """Dependency that verifies that the authenticated user possesses at least one of the specified roles."""

    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = [r.upper() for r in allowed_roles]

    def __call__(self, user: User = Depends(get_current_user)) -> User:
        user_role_names = [role.name.upper() for role in user.roles]
        if not any(role in self.allowed_roles for role in user_role_names):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {', '.join(self.allowed_roles)}. Your roles: {', '.join(user_role_names)}",
            )
        return user


class PermissionChecker:
    """Dependency that verifies the user possesses a required permission code."""

    def __init__(self, required_permission: str):
        self.required_permission = required_permission

    def __call__(self, user: User = Depends(get_current_user)) -> User:
        user_role_names = [role.name.upper() for role in user.roles]
        # Admins have global permission access
        if "ADMIN" in user_role_names:
            return user

        user_permissions = set()
        for role in user.roles:
            for perm in role.permissions:
                user_permissions.add(perm.code)

        if self.required_permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: Missing required permission '{self.required_permission}'",
            )
        return user


require_admin = RoleChecker(["ADMIN"])
require_manager = RoleChecker(["MANAGER"])
require_communication_team = RoleChecker(["COMMUNICATION_TEAM"])
require_manager_or_admin = RoleChecker(["MANAGER", "ADMIN"])
require_commteam_or_admin = RoleChecker(["COMMUNICATION_TEAM", "ADMIN"])
require_any_authenticated = get_current_user

