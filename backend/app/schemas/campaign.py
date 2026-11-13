from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class CampaignBase(BaseModel):
    title: str
    description: Optional[str] = None
    objective: str
    category: str  # Public awareness, Emergency alerts, etc.
    campaign_type: str = "STANDARD"
    target_channels: List[str] = Field(default_factory=list)  # ["WHATSAPP", "SMS", "EMAIL"]
    primary_language: str = "English"
    target_languages: List[str] = Field(default_factory=list)  # ["Telugu", "Hindi"]
    raw_content: Optional[str] = None
    proposed_delivery_date: Optional[str] = None
    proposed_delivery_time: Optional[str] = None


class CampaignCreate(CampaignBase):
    segment_ids: List[str] = Field(default_factory=list)
    contact_ids: List[str] = Field(default_factory=list)


class CampaignUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    objective: Optional[str] = None
    category: Optional[str] = None
    campaign_type: Optional[str] = None
    target_channels: Optional[List[str]] = None
    primary_language: Optional[str] = None
    target_languages: Optional[List[str]] = None
    raw_content: Optional[str] = None
    proposed_delivery_date: Optional[str] = None
    proposed_delivery_time: Optional[str] = None
    segment_ids: Optional[List[str]] = None
    contact_ids: Optional[List[str]] = None


class CampaignApprovalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    reviewer_id: str
    reviewer_name: Optional[str] = None
    decision: str
    comments: Optional[str] = None
    decided_at: datetime


class CampaignStatusHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    from_status: str
    to_status: str
    changed_by: Optional[str] = None
    changer_name: Optional[str] = None
    reason: Optional[str] = None
    created_at: datetime


class CampaignTranslationBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    language_code: str
    language_name: str
    translated_title: Optional[str] = None
    translated_body: str
    is_verified: bool


class CampaignResponse(CampaignBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    org_id: str
    created_by: str
    creator_name: Optional[str] = None
    status: str
    recipient_count: int = 0
    segment_ids: List[str] = []
    created_at: datetime
    updated_at: datetime
    translations: List[CampaignTranslationBrief] = []
    latest_approval: Optional[CampaignApprovalResponse] = None
    approvals: List[CampaignApprovalResponse] = []
    status_history: List[CampaignStatusHistoryResponse] = []


class CampaignApprovalRequest(BaseModel):
    comments: Optional[str] = "Approved after editorial and policy compliance verification."


class CampaignRejectionRequest(BaseModel):
    reason: str = Field(..., min_length=5, description="Mandatory detailed reason for rejection.")


class MessageTemplateBase(BaseModel):
    title: str
    category: str
    content: str
    variables: List[str] = Field(default_factory=list)


class MessageTemplateCreate(MessageTemplateBase):
    pass


class MessageTemplateResponse(MessageTemplateBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    org_id: str
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

