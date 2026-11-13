from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.database.session import Base
from app.models.user import generate_uuid, utc_now


class AudienceContact(Base):
    __tablename__ = "audience_contacts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=True)
    phone_number = Column(String(30), nullable=False, index=True)
    email = Column(String(255), nullable=True, index=True)
    preferred_language = Column(String(20), default="English", nullable=False, index=True)  # Telugu, Hindi, etc.
    location_state = Column(String(100), nullable=True, index=True)
    location_district = Column(String(100), nullable=True, index=True)
    gender = Column(String(20), nullable=True)
    age_group = Column(String(20), nullable=True)  # 18-25, 26-40, 41-60, 60+
    occupation = Column(String(100), nullable=True)
    is_subscribed = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    organization = relationship("Organization", back_populates="audience_contacts")
    campaign_audiences = relationship("CampaignAudience", back_populates="contact")
    deliveries = relationship("MessageDelivery", back_populates="contact")


class AudienceSegment(Base):
    __tablename__ = "audience_segments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    description = Column(String(255), nullable=True)
    filter_criteria = Column(JSON, nullable=False, default=dict)  # {"states": [...], "languages": [...], "age_groups": [...]}
    estimated_reach = Column(Integer, default=0)
    created_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    organization = relationship("Organization", back_populates="audience_segments")
    campaign_audiences = relationship("CampaignAudience", back_populates="segment")


class CampaignAudience(Base):
    __tablename__ = "campaign_audiences"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    campaign_id = Column(String(36), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True)
    segment_id = Column(String(36), ForeignKey("audience_segments.id", ondelete="CASCADE"), nullable=True, index=True)
    contact_id = Column(String(36), ForeignKey("audience_contacts.id", ondelete="CASCADE"), nullable=True, index=True)
    assigned_at = Column(DateTime, default=utc_now)

    campaign = relationship("Campaign", back_populates="campaign_audiences")
    segment = relationship("AudienceSegment", back_populates="campaign_audiences")
    contact = relationship("AudienceContact", back_populates="campaign_audiences")

