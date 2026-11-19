from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, JSON
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
    translated_title = Column(String(255), nullable=True)
    translated_body = Column(Text, nullable=False)
    is_verified = Column(Boolean, default=False)
    verified_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    campaign = relationship("Campaign", back_populates="translations")

