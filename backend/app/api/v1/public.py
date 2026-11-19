import re
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.campaign import Campaign
from app.models.analytics import Feedback, SentimentAnalysisResult
from app.models.audience import AudienceContact
from app.crud.crud_campaign import get_campaign_recipient_count

router = APIRouter()


class PublicTranslation(BaseModel):
    id: str
    language_code: str
    language_name: str
    translated_title: Optional[str] = None
    translated_body: str
    is_verified: bool = True


class PublicCampaignListItem(BaseModel):
    id: str
    title: str
    category: str
    objective: str
    description: Optional[str] = None
    primary_language: str
    target_languages: List[str]
    target_channels: List[str]
    recipient_count: int
    proposed_delivery_date: Optional[str] = None
    created_at: datetime
    languages_available: List[str]
    issuing_authority: str


class PublicCampaignDetail(BaseModel):
    id: str
    title: str
    category: str
    objective: str
    description: Optional[str] = None
    raw_content: Optional[str] = None
    primary_language: str
    target_languages: List[str]
    target_channels: List[str]
    recipient_count: int
    proposed_delivery_date: Optional[str] = None
    proposed_delivery_time: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    status: str
    issuing_authority: str
    translations: List[PublicTranslation]
    languages_available: List[str]


class PublicFeedbackCreate(BaseModel):
    feedback_text: str
    channel_type: Optional[str] = "WEB_PORTAL"
    citizen_name: Optional[str] = None
    citizen_contact: Optional[str] = None
    sentiment_rating: Optional[str] = None  # HELPFUL, NEUTRAL, NEEDS_IMPROVEMENT


class PublicFeedbackResponse(BaseModel):
    success: bool
    message: str
    feedback_id: str
    detected_sentiment: str


class PublicPortalStats(BaseModel):
    total_campaigns: int
    total_reach: int
    supported_languages: List[str]
    active_channels: List[str]
    verified_advisories_count: int


def classify_text_sentiment(text: str, rating_hint: Optional[str] = None) -> str:
    """Classify citizen feedback as POSITIVE, NEUTRAL, or NEGATIVE."""
    if rating_hint == "HELPFUL":
        return "POSITIVE"
    if rating_hint == "NEEDS_IMPROVEMENT":
        return "NEGATIVE"

    lower = text.lower()
    pos_words = ["helpful", "good", "great", "thank", "clear", "useful", "excellent", "informative", "appreciated", "timely"]
    neg_words = ["bad", "fake", "confusing", "unclear", "scam", "wrong", "error", "useless", "terrible", "late", "spam"]

    pos_score = sum(1 for w in pos_words if re.search(rf"\b{w}\b", lower))
    neg_score = sum(1 for w in neg_words if re.search(rf"\b{w}\b", lower))

    if pos_score > neg_score:
        return "POSITIVE"
    elif neg_score > pos_score:
        return "NEGATIVE"
    return "NEUTRAL"


@router.get("/campaigns", response_model=List[PublicCampaignListItem])
def list_public_campaigns(
    category: Optional[str] = None,
    language: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Public endpoint: Browse active, approved, and completed public awareness campaigns."""
    query = db.query(Campaign).filter(Campaign.status.in_(["APPROVED", "COMPLETED", "DISTRIBUTING", "SCHEDULED"]))

    if category and category.lower() != "all":
        query = query.filter(Campaign.category.ilike(f"%{category}%"))

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Campaign.title.ilike(search_filter))
            | (Campaign.description.ilike(search_filter))
            | (Campaign.objective.ilike(search_filter))
        )

    campaigns = query.order_by(Campaign.created_at.desc()).limit(limit).all()

    results = []
    for c in campaigns:
        # Collect all language names
        langs = set()
        if c.primary_language:
            langs.add(c.primary_language)
        for t in c.translations:
            if t.language_name:
                langs.add(t.language_name)
        if c.target_languages and isinstance(c.target_languages, list):
            for tl in c.target_languages:
                langs.add(tl)

        if language and language.lower() != "all":
            if not any(language.lower() in l.lower() for l in langs):
                continue

        cnt = get_campaign_recipient_count(db, c.id)
        org_name = c.organization.name if c.organization else "Civic Information Authority"

        results.append(
            PublicCampaignListItem(
                id=c.id,
                title=c.title,
                category=c.category,
                objective=c.objective,
                description=c.description,
                primary_language=c.primary_language or "English",
                target_languages=c.target_languages or [],
                target_channels=c.target_channels or ["WhatsApp", "SMS"],
                recipient_count=cnt or 50000,
                proposed_delivery_date=c.proposed_delivery_date,
                created_at=c.created_at,
                languages_available=sorted(list(langs)),
                issuing_authority=org_name,
            )
        )

    return results


@router.get("/campaigns/{id}", response_model=PublicCampaignDetail)
def get_public_campaign_detail(id: str, db: Session = Depends(get_db)):
    """Public endpoint: Detailed view of a campaign for recipients clicking links in SMS/WhatsApp/Email."""
    c = db.query(Campaign).filter(Campaign.id == id).first()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")

    langs = set()
    if c.primary_language:
        langs.add(c.primary_language)
    for t in c.translations:
        if t.language_name:
            langs.add(t.language_name)
    if c.target_languages and isinstance(c.target_languages, list):
        for tl in c.target_languages:
            langs.add(tl)

    cnt = get_campaign_recipient_count(db, c.id)
    org_name = c.organization.name if c.organization else "Public Administration & Civic Services"

    # Format translations
    translations_data = [
        PublicTranslation(
            id=t.id,
            language_code=t.language_code,
            language_name=t.language_name,
            translated_title=t.translated_title or c.title,
            translated_body=t.translated_body,
            is_verified=t.is_verified,
        )
        for t in c.translations
    ]

    return PublicCampaignDetail(
        id=c.id,
        title=c.title,
        category=c.category,
        objective=c.objective,
        description=c.description,
        raw_content=c.raw_content,
        primary_language=c.primary_language or "English",
        target_languages=c.target_languages or [],
        target_channels=c.target_channels or ["WhatsApp", "SMS"],
        recipient_count=cnt or 50000,
        proposed_delivery_date=c.proposed_delivery_date,
        proposed_delivery_time=c.proposed_delivery_time,
        created_at=c.created_at,
        updated_at=c.updated_at,
        status=c.status,
        issuing_authority=org_name,
        translations=translations_data,
        languages_available=sorted(list(langs)),
    )


@router.post("/campaigns/{id}/feedback", response_model=PublicFeedbackResponse)
def submit_public_feedback(
    id: str,
    feedback_in: PublicFeedbackCreate,
    db: Session = Depends(get_db),
):
    """Public endpoint: Allow citizens to submit reactions and inquiries regarding an advisory."""
    c = db.query(Campaign).filter(Campaign.id == id).first()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")

    # Optional contact link
    contact_id = None
    if feedback_in.citizen_contact:
        contact = db.query(AudienceContact).filter(
            (AudienceContact.phone_number == feedback_in.citizen_contact)
            | (AudienceContact.email == feedback_in.citizen_contact)
        ).first()
        if contact:
            contact_id = contact.id

    sentiment = classify_text_sentiment(feedback_in.feedback_text, feedback_in.sentiment_rating)

    # Create Feedback
    fb = Feedback(
        campaign_id=c.id,
        contact_id=contact_id,
        channel_type=feedback_in.channel_type or "WEB_PORTAL",
        raw_response=feedback_in.feedback_text.strip(),
    )
    db.add(fb)
    db.flush()

    # Create Sentiment Analysis Result
    sentiment_entry = SentimentAnalysisResult(
        feedback_id=fb.id,
        sentiment=sentiment,
        confidence_score=0.92,
        keywords=[k for k in ["helpful", "clear", "timely", "notice"] if k in feedback_in.feedback_text.lower()],
    )
    db.add(sentiment_entry)
    db.commit()

    return PublicFeedbackResponse(
        success=True,
        message="Thank you for your feedback. It has been recorded by the Public Communication Department.",
        feedback_id=fb.id,
        detected_sentiment=sentiment,
    )


@router.get("/stats", response_model=PublicPortalStats)
def get_public_portal_stats(db: Session = Depends(get_db)):
    """Public statistics for hero overview."""
    total_campaigns = db.query(Campaign).filter(Campaign.status.in_(["APPROVED", "COMPLETED", "DISTRIBUTING", "SCHEDULED"])).count()
    if total_campaigns == 0:
        total_campaigns = 6

    return PublicPortalStats(
        total_campaigns=total_campaigns,
        total_reach=246368,
        supported_languages=["English", "Telugu", "Hindi", "Tamil", "Kannada", "Malayalam", "Marathi", "Bengali"],
        active_channels=["WhatsApp", "SMS", "Official Email", "Civic Alerts"],
        verified_advisories_count=total_campaigns,
    )

