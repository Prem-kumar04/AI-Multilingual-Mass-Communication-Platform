from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.crud.crud_user import authenticate_user
from app.crud.crud_audit import log_audit_event
from app.database.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, Token, UserLoginResponse, RoleBrief
from app.core.permissions import get_current_user

router = APIRouter()


@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate with email and password, returning JWT access token and user role profile."""
    user = authenticate_user(db, email=login_data.email, password=login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is deactivated. Please contact an Administrator.",
        )

    access_token = create_access_token(subject=user.id)

    # Flatten permissions
    permissions_list = set()
    for role in user.roles:
        for perm in role.permissions:
            permissions_list.add(perm.code)

    # Record login audit event
    log_audit_event(
        db=db,
        action="USER_LOGIN",
        resource_type="USER",
        user_id=user.id,
        org_id=user.org_id,
        resource_id=user.id,
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserLoginResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            org_id=user.org_id,
            is_active=user.is_active,
            roles=[RoleBrief(id=r.id, name=r.name, description=r.description) for r in user.roles],
            permissions=sorted(list(permissions_list)),
        ),
    )


@router.get("/me", response_model=UserLoginResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Retrieve current authenticated user session and role profile."""
    permissions_list = set()
    for role in current_user.roles:
        for perm in role.permissions:
            permissions_list.add(perm.code)

    return UserLoginResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        org_id=current_user.org_id,
        is_active=current_user.is_active,
        roles=[RoleBrief(id=r.id, name=r.name, description=r.description) for r in current_user.roles],
        permissions=sorted(list(permissions_list)),
    )

