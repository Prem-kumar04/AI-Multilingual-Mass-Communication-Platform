from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship

from app.database.session import Base
from app.models.user import generate_uuid, utc_now


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    objective = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)  # Public awareness, Emergency alerts, etc.
    campaign_type = Column(String(50), default="STANDARD", nullable=False)
    status = Column(String(50), default="DRAFT", nullable=False, index=True)
    target_channels = Column(JSON, default=list, nullable=False)  # ["WHATSAPP", "SMS", "EMAIL"]
    primary_language = Column(String(50), default="English", nullable=False)
    target_languages = Column(JSON, default=list, nullable=False)  # ["Telugu", "Hindi", "Tamil"]
    raw_content = Column(Text, nullable=True)
    proposed_delivery_date = Column(String(30), nullable=True)
    proposed_delivery_time = Column(String(30), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    organization = relationship("Organization", back_populates="campaigns")
    creator = relationship("User", back_populates="campaigns_created")
    versions = relationship("CampaignVersion", back_populates="campaign", cascade="all, delete-orphan")
    approvals = relationship("CampaignApproval", back_populates="campaign", cascade="all, delete-orphan")
    status_history = relationship("CampaignStatusHistory", back_populates="campaign", cascade="all, delete-orphan")
    campaign_audiences = relationship("CampaignAudience", back_populates="campaign", cascade="all, delete-orphan")
    generated_contents = relationship("GeneratedContent", back_populates="campaign", cascade="all, delete-orphan")
    translations = relationship("CampaignTranslation", back_populates="campaign", cascade="all, delete-orphan")
    quality_reports = relationship("CampaignQualityReport", back_populates="campaign", cascade="all, delete-orphan")
    personalization_variants = relationship("CampaignPersonalizationVariant", back_populates="campaign", cascade="all, delete-orphan")
    distribution_jobs = relationship("DistributionJob", back_populates="campaign", cascade="all, delete-orphan")
    feedback_entries = relationship("Feedback", back_populates="campaign", cascade="all, delete-orphan")


class CampaignVersion(Base):
    __tablename__ = "campaign_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    campaign_id = Column(String(36), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    raw_content = Column(Text, nullable=False)
    content_hash = Column(String(128), nullable=False)
    content_snapshot = Column(JSON, default=dict)  # full snapshot of title, content, translations, channels
    created_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    campaign = relationship("Campaign", back_populates="versions")


class CampaignApproval(Base):
    __tablename__ = "campaign_approvals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    campaign_id = Column(String(36), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    decision = Column(String(30), nullable=False)  # APPROVED, REJECTED
    comments = Column(Text, nullable=True)
    decided_at = Column(DateTime, default=utc_now)

    campaign = relationship("Campaign", back_populates="approvals")
    reviewer = relationship("User", back_populates="approvals_given")


class CampaignStatusHistory(Base):
    __tablename__ = "campaign_status_history"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    campaign_id = Column(String(36), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True)
    from_status = Column(String(50), nullable=False)
    to_status = Column(String(50), nullable=False)
    changed_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    campaign = relationship("Campaign", back_populates="status_history")


class MessageTemplate(Base):
    __tablename__ = "message_templates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    variables = Column(JSON, default=list)  # ["name", "date", "location"]
    created_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

