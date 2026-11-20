from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class SupportedLanguageItem(BaseModel):
    code: str
    name: str
    native_name: str
    script: str
    region: str


class TranslateTextRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Source text to translate")
    target_language: str = Field(..., description="Target language name or ISO code, e.g. Telugu or te")
    source_language: str = Field("English", description="Source language, defaults to English")
    title: Optional[str] = Field(None, description="Optional title or headline to translate")
    context: Optional[str] = Field("Public Civic Awareness", description="Domain context for tone accuracy")


class TranslationItemResponse(BaseModel):
    language_code: str
    language_name: str
    original_text: str
    translated_title: Optional[str] = None
    translated_body: str
    cultural_notes: Optional[str] = None
    is_verified: bool = False
    verified_by: Optional[str] = None
    reviewer_notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    id: Optional[str] = None


class BatchTranslateResponse(BaseModel):
    source_language: str
    original_text: str
    translations: List[TranslationItemResponse]


class CampaignTranslationGenerateRequest(BaseModel):
    target_languages: Optional[List[str]] = Field(None, description="Optional subset of languages, defaults to campaign target_languages")


class TranslationReviewRequest(BaseModel):
    is_verified: bool = Field(..., description="Mark translation verified or unverified")
    edited_title: Optional[str] = Field(None, description="Optional reviewer-edited headline")
    edited_body: Optional[str] = Field(None, description="Optional reviewer-edited message body")
    reviewer_notes: Optional[str] = Field(None, description="Reviewer comments or verification notes")

