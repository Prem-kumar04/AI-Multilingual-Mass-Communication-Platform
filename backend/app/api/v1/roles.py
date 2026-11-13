from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.database.session import get_db
from app.models.user import Role, Permission, User
from app.schemas.user import RoleResponse, PermissionResponse
from app.core.permissions import require_admin

router = APIRouter()


@router.get("", response_model=List[RoleResponse])
def get_all_roles(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Admin endpoint to retrieve all system roles and their assigned permissions."""
    return (
        db.query(Role)
        .options(joinedload(Role.permissions))
        .all()
    )


@router.get("/permissions", response_model=List[PermissionResponse])
def get_all_permissions(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Admin endpoint to retrieve all registered permissions."""
    return db.query(Permission).order_by(Permission.resource, Permission.action).all()

