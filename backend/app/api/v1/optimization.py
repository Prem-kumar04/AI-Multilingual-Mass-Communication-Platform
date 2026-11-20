from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.core.permissions import require_any_authenticated
from app.schemas.optimization import (
    SentimentAnalysisRequest,
    SentimentAnalysisResponse,
    AudienceSegmentProfile,
    PersonalizationRequest,
    PersonalizationComparisonResponse,
    CampaignPersonalizeRequest,
)
from app.services.optimization_service import optimization_service
from app.models.content import CampaignPersonalizationVariant
from app.crud.crud_audit import log_audit_event

router = APIRouter()


@router.get("/segments", response_model=List[AudienceSegmentProfile])
def get_supported_segments(
    current_user: User = Depends(require_any_authenticated),
):
    """Retrieve demographic audience profiles for targeted message optimization."""
    return optimization_service.get_supported_segments()


@router.post("/analyze-sentiment", response_model=SentimentAnalysisResponse)
def analyze_content_sentiment(
    payload: SentimentAnalysisRequest,
    current_user: User = Depends(require_any_authenticated),
):
    """Analyze sentiment polarity, empathy, clarity, and generate actionable tone improvement suggestions."""
    return optimization_service.analyze_sentiment(
        text=payload.text,
        campaign_name=payload.campaign_name,
    )


@router.post("/personalize", response_model=PersonalizationComparisonResponse)
def personalize_message(
    payload: PersonalizationRequest,
    current_user: User = Depends(require_any_authenticated),
):
    """Generate audience-specific message with side-by-side comparison, reading ease delta, and sentiment comparison."""
    return optimization_service.personalize_content(
        text=payload.text,
        target_audience=payload.target_audience,
        title=payload.title,
        campaign_name=payload.campaign_name,
        campaign_objective=payload.campaign_objective,
        preferred_tone=payload.preferred_tone,
    )


@router.post("/campaign/{campaign_id}/personalize", response_model=List[PersonalizationComparisonResponse])
def personalize_campaign_endpoint(
    campaign_id: str,
    payload: CampaignPersonalizeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
):
    """Generate and store personalized content variants for the selected demographic segments."""
    try:
        results = optimization_service.personalize_campaign(
            db=db,
            campaign_id=campaign_id,
            target_segments=payload.target_segments,
            user_id=current_user.id,
        )
        log_audit_event(
            db=db,
            action="CAMPAIGN_PERSONALIZED",
            resource_type="CAMPAIGN_VARIANT",
            user_id=current_user.id,
            org_id=current_user.org_id,
            resource_id=campaign_id,
            payload_after={"segments": payload.target_segments},
        )
        return results
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Personalization failed: {str(e)}")


@router.get("/campaign/{campaign_id}/variants", response_model=List[dict])
def get_campaign_variants(
    campaign_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
):
    """Retrieve all stored personalized variants for a campaign."""
    records = (
        db.query(CampaignPersonalizationVariant)
        .filter(CampaignPersonalizationVariant.campaign_id == campaign_id)
        .order_by(CampaignPersonalizationVariant.created_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "campaign_id": r.campaign_id,
            "segment_name": r.segment_name,
            "target_audience": r.target_audience,
            "optimized_headline": r.optimized_headline,
            "optimized_content": r.optimized_content,
            "tone_applied": r.tone_applied,
            "sentiment_analysis": r.sentiment_analysis,
            "improvement_notes": r.improvement_notes,
            "created_at": r.created_at,
        }
        for r in records
    ]

