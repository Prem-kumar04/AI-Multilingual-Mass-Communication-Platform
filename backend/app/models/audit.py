from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.database.session import Base
from app.models.user import generate_uuid, utc_now


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)  # e.g., USER_LOGIN, CAMPAIGN_SUBMIT, CAMPAIGN_APPROVE
    resource_type = Column(String(50), nullable=False, index=True)  # CAMPAIGN, USER, AUDIENCE
    resource_id = Column(String(36), nullable=True, index=True)
    ip_address = Column(String(45), nullable=True)
    payload_before = Column(JSON, nullable=True)
    payload_after = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=utc_now, index=True)

    user = relationship("User", back_populates="audit_logs")

