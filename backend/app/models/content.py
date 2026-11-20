from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship

from app.database.session import Base
from app.models.user import generate_uuid, utc_now


class GeneratedContent(Base):
    __tablename__ = "generated_contents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    campaign_id = Column(String(36), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=True, index=True)
    prompt = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    tone = Column(String(50), nullable=False)
    language = Column(String(50), default="English", nullable=False)
    content_type = Column(String(50), default="STANDARD", nullable=False)
    headline = Column(Text, nullable=True)
    call_to_action = Column(Text, nullable=True)
    raw_output = Column(Text, nullable=False)
    metadata_json = Column(JSON, default=dict)
    tokens_used = Column(Integer, default=0)
    model_name = Column(String(100), default="gemini-2.5-flash")
    created_at = Column(DateTime, default=utc_now)

    campaign = relationship("Campaign", back_populates="generated_contents")


class CampaignTranslation(Base):
    __tablename__ = "campaign_translations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    campaign_id = Column(String(36), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True)
    language_code = Column(String(10), nullable=False, index=True)  # te, hi, ta, kn, ml, mr, bn, en
    language_name = Column(String(50), nullable=False)  # Telugu, Hindi, etc.
    original_text = Column(Text, nullable=True)
    translated_title = Column(String(255), nullable=True)
    translated_body = Column(Text, nullable=False)
    cultural_notes = Column(Text, nullable=True)
    reviewer_notes = Column(Text, nullable=True)
    is_verified = Column(Boolean, default=False)
    verified_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    campaign = relationship("Campaign", back_populates="translations")
    verifier = relationship("User", foreign_keys=[verified_by])


class CampaignQualityReport(Base):
    __tablename__ = "campaign_quality_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    campaign_id = Column(String(36), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True)
    clarity_score = Column(Integer, default=85)
    readability_score = Column(Integer, default=85)
    compliance_score = Column(Integer, default=95)
    compliance_status = Column(String(50), default="COMPLIANT")  # COMPLIANT, NEEDS_REVIEW, NON_COMPLIANT
    sentiment_label = Column(String(50), default="POSITIVE")  # POSITIVE, NEUTRAL, URGENT_ALERT
    sentiment_score = Column(Float, default=0.5)
    flags = Column(JSON, default=list)  # list of violation/warning dicts
    suggestions = Column(JSON, default=list)  # list of improvement suggestions
    checked_at = Column(DateTime, default=utc_now)
    checked_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    campaign = relationship("Campaign", back_populates="quality_reports")
    checker = relationship("User", foreign_keys=[checked_by])


class CampaignPersonalizationVariant(Base):
    __tablename__ = "campaign_personalization_variants"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    campaign_id = Column(String(36), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True)
    segment_name = Column(String(100), nullable=False)
    target_audience = Column(String(100), nullable=False)
    optimized_headline = Column(String(255), nullable=True)
    optimized_content = Column(Text, nullable=False)
    tone_applied = Column(String(100), nullable=True)
    sentiment_analysis = Column(JSON, default=dict)
    improvement_notes = Column(JSON, default=list)
    created_at = Column(DateTime, default=utc_now)

    campaign = relationship("Campaign", back_populates="personalization_variants")


