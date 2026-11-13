from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship

from app.database.session import Base
from app.models.user import generate_uuid, utc_now


class CommunicationChannel(Base):
    __tablename__ = "communication_channels"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    channel_type = Column(String(50), unique=True, nullable=False, index=True)  # WHATSAPP, SMS, EMAIL, PUSH, WEB_BROADCAST
    provider_name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    rate_limit_per_second = Column(Integer, default=50)
    credentials_encrypted = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    distribution_jobs = relationship("DistributionJob", back_populates="channel")


class DistributionJob(Base):
    __tablename__ = "distribution_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    campaign_id = Column(String(36), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True)
    channel_id = Column(String(36), ForeignKey("communication_channels.id", ondelete="SET NULL"), nullable=True, index=True)
    status = Column(String(50), default="QUEUED", nullable=False, index=True)  # QUEUED, PROCESSING, COMPLETED, FAILED
    total_count = Column(Integer, default=0)
    sent_count = Column(Integer, default=0)
    delivered_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    campaign = relationship("Campaign", back_populates="distribution_jobs")
    channel = relationship("CommunicationChannel", back_populates="distribution_jobs")
    deliveries = relationship("MessageDelivery", back_populates="job", cascade="all, delete-orphan")


class MessageDelivery(Base):
    __tablename__ = "message_deliveries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    job_id = Column(String(36), ForeignKey("distribution_jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    contact_id = Column(String(36), ForeignKey("audience_contacts.id", ondelete="CASCADE"), nullable=False, index=True)
    channel_type = Column(String(50), nullable=False, index=True)
    recipient_address = Column(String(255), nullable=False)  # phone number or email
    provider_message_id = Column(String(255), nullable=True, index=True)
    idempotency_key = Column(String(255), unique=True, nullable=False, index=True)
    status = Column(String(50), default="QUEUED", nullable=False, index=True)  # QUEUED, SENT, DELIVERED, FAILED
    error_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    job = relationship("DistributionJob", back_populates="deliveries")
    contact = relationship("AudienceContact", back_populates="deliveries")
    attempts = relationship("DeliveryAttempt", back_populates="delivery", cascade="all, delete-orphan")
    engagement_events = relationship("EngagementEvent", back_populates="delivery", cascade="all, delete-orphan")


class DeliveryAttempt(Base):
    __tablename__ = "delivery_attempts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    delivery_id = Column(String(36), ForeignKey("message_deliveries.id", ondelete="CASCADE"), nullable=False, index=True)
    attempt_number = Column(Integer, default=1)
    status_code = Column(Integer, nullable=True)
    provider_response = Column(JSON, default=dict)
    error_message = Column(Text, nullable=True)
    attempted_at = Column(DateTime, default=utc_now)

    delivery = relationship("MessageDelivery", back_populates="attempts")

