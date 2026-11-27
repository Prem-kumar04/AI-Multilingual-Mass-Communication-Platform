from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
)
from app.crud.crud_user import authenticate_user
from app.crud.crud_audit import log_audit_event
from app.database.session import get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    Token,
    RefreshTokenRequest,
    RefreshTokenResponse,
    UserLoginResponse,
    RoleBrief,
)
from app.core.permissions import get_current_user

router = APIRouter()


@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    """Authenticate with email and password, returning JWT access & refresh tokens and setting auth cookies."""
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
    refresh_token = create_refresh_token(subject=user.id)

    # Set access and refresh tokens in HTTP cookies (accessible to browser DevTools and requests)
    access_max_age = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    refresh_max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400

    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=access_max_age,
        path="/",
        samesite="lax",
        httponly=False,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=refresh_max_age,
        path="/",
        samesite="lax",
        httponly=False,
    )

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
        refresh_token=refresh_token,
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


@router.post("/refresh", response_model=RefreshTokenResponse)
def refresh_token(
    request: Request,
    response: Response,
    body: Optional[RefreshTokenRequest] = None,
    db: Session = Depends(get_db),
):
    """Generate new access & refresh tokens from refresh token supplied in request body or cookie."""
    token = None
    if body and body.refresh_token:
        token = body.refresh_token
    elif "refresh_token" in request.cookies:
        token = request.cookies.get("refresh_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_refresh_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token payload",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    new_access_token = create_access_token(subject=user.id)
    new_refresh_token = create_refresh_token(subject=user.id)

    access_max_age = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    refresh_max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400

    response.set_cookie(
        key="access_token",
        value=new_access_token,
        max_age=access_max_age,
        path="/",
        samesite="lax",
        httponly=False,
    )
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        max_age=refresh_max_age,
        path="/",
        samesite="lax",
        httponly=False,
    )

    return RefreshTokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
    )


@router.post("/logout")
def logout(response: Response):
    """Clear access and refresh token cookies upon logout."""
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return {"message": "Logged out successfully"}


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

