from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class ComplianceFlag(BaseModel):
    rule: str  # PII_PROTECTION, CIVIC_NEUTRALITY, OFFENSIVE_CONTENT, MISINFORMATION_CHECK, EMERGENCY_DISCLOSURES
    severity: str  # INFO, WARNING, CRITICAL
    title: str
    description: str
    snippet: Optional[str] = None
    suggestion: str


class ContentQualityCheckRequest(BaseModel):
    text: str = Field(..., min_length=5, description="Campaign content text to validate")
    title: Optional[str] = Field(None, description="Campaign title or subject")
    category: str = Field("Public Awareness", description="Campaign classification")
    is_emergency: bool = Field(False, description="Flag indicating if this is an urgent emergency alert")


class ContentQualityReportResponse(BaseModel):
    clarity_score: int = Field(..., ge=0, le=100)
    readability_score: int = Field(..., ge=0, le=100)
    readability_grade: str  # Easy, Standard, Difficult, Technical
    compliance_score: int = Field(..., ge=0, le=100)
    compliance_status: str  # COMPLIANT, NEEDS_REVIEW, NON_COMPLIANT
    sentiment_label: str
    sentiment_score: float
    flags: List[ComplianceFlag] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
    checked_at: datetime
    campaign_id: Optional[str] = None
    id: Optional[str] = None


class ComplianceRuleItem(BaseModel):
    rule_code: str
    name: str
    description: str
    severity_level: str
    mandatory_for: List[str]

