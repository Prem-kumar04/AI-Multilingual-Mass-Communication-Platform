from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class SentimentAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=3, description="Content text to analyze for sentiment and tone")
    campaign_name: Optional[str] = Field(None, description="Optional campaign context")


class SentimentAnalysisResponse(BaseModel):
    polarity: str  # POSITIVE, NEUTRAL, URGENT_ALERT, NEGATIVE
    polarity_score: float = Field(..., ge=-1.0, le=1.0)
    empathy_score: int = Field(..., ge=0, le=100)
    clarity_score: int = Field(..., ge=0, le=100)
    civic_friendliness_score: int = Field(..., ge=0, le=100)
    detected_tone: str
    urgency_level: str  # LOW, MODERATE, HIGH, CRITICAL
    tone_improvement_suggestions: List[str] = Field(default_factory=list)


class AudienceSegmentProfile(BaseModel):
    key: str
    name: str
    description: str
    recommended_tone: str
    key_characteristics: List[str]


class PersonalizationRequest(BaseModel):
    text: str = Field(..., min_length=5, description="Original base content")
    title: Optional[str] = Field(None, description="Original headline or title")
    target_audience: str = Field(..., description="Target segment, e.g. RURAL_CITIZENS, ELDERLY_PENSIONERS, YOUTH_STUDENTS, FARMERS_AGRICULTURE")
    campaign_name: Optional[str] = Field(None, description="Campaign title or theme")
    campaign_objective: Optional[str] = Field(None, description="Campaign primary objective")
    preferred_tone: Optional[str] = Field(None, description="Optional custom tone override")


class PersonalizationComparisonResponse(BaseModel):
    target_audience: str
    target_audience_label: str
    original_title: Optional[str] = None
    original_content: str
    optimized_title: Optional[str] = None
    optimized_content: str
    tone_applied: str
    changes_made: List[str] = Field(default_factory=list)
    reading_ease_delta: str
    sentiment_before: SentimentAnalysisResponse
    sentiment_after: SentimentAnalysisResponse
    improvement_notes: List[str] = Field(default_factory=list)
    created_at: Optional[datetime] = None


class CampaignPersonalizeRequest(BaseModel):
    target_segments: List[str] = Field(..., min_length=1, description="List of target audience segment keys to optimize for")

