from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserCreate, UserUpdate
from app.crud.crud_user import get_users, create_user, update_user, get_user_by_id
from app.crud.crud_audit import log_audit_event
from app.core.permissions import require_admin, get_current_user

router = APIRouter()


@router.get("", response_model=List[UserResponse])
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Admin endpoint to list all platform users with role and search filters."""
    return get_users(
        db=db,
        skip=skip,
        limit=limit,
        role_filter=role,
        is_active=is_active,
        search=search,
    )


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_new_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Admin endpoint to register a new user and assign roles."""
    created = create_user(db=db, user_in=user_in, default_org_id=admin_user.org_id)
    log_audit_event(
        db=db,
        action="USER_CREATE",
        resource_type="USER",
        user_id=admin_user.id,
        org_id=admin_user.org_id,
        resource_id=created.id,
        payload_after={"email": created.email, "roles": [r.name for r in created.roles]},
    )
    return created


@router.get("/{user_id}", response_model=UserResponse)
def get_user_detail(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get single user detail (Admin or self)."""
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Check if admin or self
    is_admin = any(r.name == "ADMIN" for r in current_user.roles)
    if not is_admin and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user_profile(
    user_id: str,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Admin endpoint to update user information, toggle activation, or reassign roles."""
    updated = update_user(db=db, user_id=user_id, user_in=user_in)
    log_audit_event(
        db=db,
        action="USER_UPDATE",
        resource_type="USER",
        user_id=admin_user.id,
        org_id=admin_user.org_id,
        resource_id=updated.id,
        payload_after={"email": updated.email, "is_active": updated.is_active},
    )
    return updated

