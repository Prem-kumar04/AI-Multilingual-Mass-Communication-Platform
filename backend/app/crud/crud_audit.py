from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.audit import AuditLog


def log_audit_event(
    db: Session,
    action: str,
    resource_type: str,
    user_id: Optional[str] = None,
    org_id: Optional[str] = None,
    resource_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    payload_before: Optional[Dict[str, Any]] = None,
    payload_after: Optional[Dict[str, Any]] = None,
) -> AuditLog:
    """Create an immutable audit log entry."""
    audit_entry = AuditLog(
        org_id=org_id,
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        ip_address=ip_address,
        payload_before=payload_before,
        payload_after=payload_after,
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    return audit_entry

