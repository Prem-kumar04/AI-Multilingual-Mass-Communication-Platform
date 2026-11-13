from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class AudienceContactBase(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    phone_number: str
    email: Optional[EmailStr] = None
    preferred_language: str = "English"
    location_state: Optional[str] = None
    location_district: Optional[str] = None
    gender: Optional[str] = None
    age_group: Optional[str] = None
    occupation: Optional[str] = None
    is_subscribed: bool = True


class AudienceContactCreate(AudienceContactBase):
    org_id: Optional[str] = None


class AudienceContactUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    preferred_language: Optional[str] = None
    location_state: Optional[str] = None
    location_district: Optional[str] = None
    gender: Optional[str] = None
    age_group: Optional[str] = None
    occupation: Optional[str] = None
    is_subscribed: Optional[bool] = None


class AudienceContactResponse(AudienceContactBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    org_id: str
    created_at: datetime
    updated_at: datetime


class AudienceSegmentBase(BaseModel):
    name: str
    description: Optional[str] = None
    filter_criteria: Dict[str, Any] = Field(default_factory=dict)


class AudienceSegmentCreate(AudienceSegmentBase):
    pass


class AudienceSegmentResponse(AudienceSegmentBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    org_id: str
    estimated_reach: int
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class CSVImportSummary(BaseModel):
    total_rows: int
    imported_count: int
    skipped_count: int
    errors: List[str] = []

