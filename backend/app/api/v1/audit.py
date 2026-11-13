from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload

from app.database.session import get_db
from app.models.user import User
from app.models.audit import AuditLog
from app.core.permissions import require_admin

router = APIRouter()


class AuditLogResponse(BaseModel):
    id: str
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    ip_address: Optional[str] = None
    payload_before: Optional[dict] = None
    payload_after: Optional[dict] = None
    timestamp: datetime

    class Config:
        from_attributes = True


@router.get("", response_model=List[AuditLogResponse])
def get_audit_trail(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Admin endpoint to retrieve immutable platform security and governance audit logs."""
    query = (
        db.query(AuditLog)
        .options(joinedload(AuditLog.user))
        .filter(AuditLog.org_id == admin_user.org_id)
    )
    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action.strip()}%"))
    if resource_type:
        query = query.filter(AuditLog.resource_type == resource_type.upper())

    logs = query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()

    results = []
    for log in logs:
        results.append(
            AuditLogResponse(
                id=log.id,
                action=log.action,
                resource_type=log.resource_type,
                resource_id=log.resource_id,
                user_id=log.user_id,
                user_name=log.user.full_name if log.user else "System",
                ip_address=log.ip_address,
                payload_before=log.payload_before,
                payload_after=log.payload_after,
                timestamp=log.timestamp,
            )
        )
    return results

