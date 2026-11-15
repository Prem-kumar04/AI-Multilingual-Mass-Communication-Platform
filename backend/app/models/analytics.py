from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship

from app.database.session import Base
from app.models.user import generate_uuid, utc_now


class EngagementEvent(Base):
    __tablename__ = "engagement_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    delivery_id = Column(String(36), ForeignKey("message_deliveries.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False, index=True)  # OPENED, CLICKED, OPT_OUT
    event_metadata = Column(JSON, default=dict)
    occurred_at = Column(DateTime, default=utc_now)

    delivery = relationship("MessageDelivery", back_populates="engagement_events")


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    campaign_id = Column(String(36), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True)
    contact_id = Column(String(36), ForeignKey("audience_contacts.id", ondelete="SET NULL"), nullable=True, index=True)
    channel_type = Column(String(50), nullable=False)
    raw_response = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    campaign = relationship("Campaign", back_populates="feedback_entries")
    sentiment_result = relationship("SentimentAnalysisResult", back_populates="feedback", uselist=False, cascade="all, delete-orphan")


class SentimentAnalysisResult(Base):
    __tablename__ = "sentiment_analysis_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    feedback_id = Column(String(36), ForeignKey("feedback.id", ondelete="CASCADE"), unique=True, nullable=False)
    sentiment = Column(String(20), nullable=False, index=True)  # POSITIVE, NEUTRAL, NEGATIVE
    confidence_score = Column(Float, default=0.0)
    keywords = Column(JSON, default=list)
    analyzed_at = Column(DateTime, default=utc_now)

    feedback = relationship("Feedback", back_populates="sentiment_result")

