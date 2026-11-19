from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class ContentVariation(BaseModel):
    variation_id: int
    headline: str
    content: str
    call_to_action: str
    hashtags: List[str] = Field(default_factory=list)


class ContentGenerationRequest(BaseModel):
    campaign_name: str = Field(..., min_length=3, max_length=255, description="Name or title of the campaign")
    campaign_objective: str = Field(..., min_length=5, description="Primary goal or objective of the campaign")
    target_audience: str = Field(..., min_length=2, max_length=255, description="Intended audience (e.g. Young Adults, Rural Citizens)")
    product_or_service_details: Optional[str] = Field(None, description="Optional details about specific service, product, or civic initiative")
    campaign_type: str = Field("PUBLIC_AWARENESS", description="Classification: PUBLIC_AWARENESS, MARKETING_PROMOTION, EMERGENCY_ALERT, etc.")
    content_type: str = Field("WHATSAPP", description="Target format: EMAIL, SOCIAL_MEDIA, SMS, WHATSAPP, MARKETING_HEADLINE, PRODUCT_DESCRIPTION, ADVERTISEMENT_COPY, CALL_TO_ACTION")
    preferred_tone: str = Field("Professional & Authoritative", description="Tone of voice")
    additional_instructions: Optional[str] = Field(None, description="Any specific hashtags, keywords, or constraints")
    content_length: str = Field("MEDIUM", description="Length preference: SHORT, MEDIUM, DETAILED")
    target_language: str = Field("English", description="Target language: English, Telugu, Hindi, Tamil, Kannada, etc.")
    variations_count: int = Field(1, ge=1, le=5, description="Number of alternative variations to generate")
    campaign_id: Optional[str] = Field(None, description="Optional associated Campaign ID in database")


class ContentRegenerationRequest(BaseModel):
    original_content_id: Optional[str] = Field(None, description="ID of previously saved generated content if applicable")
    campaign_name: str = Field(..., min_length=3, description="Campaign title")
    campaign_objective: str = Field(..., min_length=5, description="Campaign objective")
    target_audience: str = Field(..., min_length=2, description="Target demographic")
    content_type: str = Field(..., description="Content format type")
    previous_content: str = Field(..., min_length=5, description="Previous content body to improve or revise")
    new_tone: Optional[str] = Field(None, description="Adjusted tone of voice")
    new_length: Optional[str] = Field(None, description="Adjusted length: SHORT, MEDIUM, DETAILED")
    additional_instructions: Optional[str] = Field(None, description="Specific revision instructions, e.g., 'Make it more urgent'")
    target_language: str = Field("English", description="Language of revised content")
    variations_count: int = Field(1, ge=1, le=5, description="Number of alternative revisions")
    campaign_id: Optional[str] = Field(None, description="Associated Campaign ID")


class ContentGenerationResponse(BaseModel):
    request_id: str
    campaign_id: Optional[str] = None
    campaign_name: str
    campaign_type: str
    content_type: str
    tone: str
    target_language: str
    headline: str
    content: str
    call_to_action: str
    suggested_hashtags: List[str] = Field(default_factory=list)
    variations: List[ContentVariation] = Field(default_factory=list)
    generation_status: str  # SUCCESS, FALLBACK
    model_used: str
    tokens_used: int = 0
    created_at: datetime
    metadata: Dict[str, Any] = Field(default_factory=dict)


class PromptTemplateItem(BaseModel):
    key: str
    name: str
    description: str
    default_length: str


class AIServiceConfigStatus(BaseModel):
    service_initialized: bool
    active_provider: str
    model_name: str
    supported_content_types: List[str]
    supported_tones: List[str]
    api_key_configured: bool
