import json
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.content import GeneratedContent
from app.models.campaign import Campaign
from app.schemas.content_generation import (
    ContentGenerationRequest,
    ContentRegenerationRequest,
    ContentGenerationResponse,
    PromptTemplateItem,
    AIServiceConfigStatus,
)
from app.services.ai_service import ai_service
from app.services.prompt_templates import (
    SUPPORTED_CONTENT_TYPES,
    SUPPORTED_TONES,
)
from app.core.permissions import require_any_authenticated

logger = logging.getLogger("content_generation_api")
router = APIRouter()


@router.post("/generate", response_model=ContentGenerationResponse, status_code=status.HTTP_200_OK)
def generate_campaign_content(
    payload: ContentGenerationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
):
    """Generate structured campaign content for various content formats (Email, WhatsApp, Social, SMS, Headlines, etc.)."""
    # 1. Validation
    if not payload.campaign_name.strip():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Campaign name cannot be empty.")
    if not payload.campaign_objective.strip():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Campaign objective is required.")

    ctype_upper = payload.content_type.upper()
    if ctype_upper not in SUPPORTED_CONTENT_TYPES:
        valid_types = ", ".join(SUPPORTED_CONTENT_TYPES.keys())
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported content type '{payload.content_type}'. Must be one of: {valid_types}",
        )

    # 2. Check campaign existence if campaign_id is supplied
    campaign = None
    if payload.campaign_id:
        campaign = db.query(Campaign).filter(Campaign.id == payload.campaign_id).first()
        if not campaign:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated campaign not found.")

    # 3. Invoke AI Service
    try:
        response = ai_service.generate_content(payload)
    except Exception as exc:
        logger.error(f"Content generation error: {str(exc)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate campaign content. Please try again or adjust parameters.",
        )

    # 4. Save to database history
    try:
        content_record = GeneratedContent(
            campaign_id=payload.campaign_id,
            prompt=f"{payload.campaign_name}: {payload.campaign_objective} ({payload.content_type})",
            category=payload.campaign_type,
            tone=payload.preferred_tone,
            language=payload.target_language,
            content_type=ctype_upper,
            headline=response.headline,
            call_to_action=response.call_to_action,
            raw_output=response.content,
            tokens_used=response.tokens_used,
            model_name=response.model_used,
            metadata_json={
                "hashtags": response.suggested_hashtags,
                "variations_count": len(response.variations),
                "generated_by": current_user.email,
            },
        )
        db.add(content_record)
        db.commit()
    except Exception as db_err:
        logger.warning(f"Failed to record generated content to DB: {str(db_err)}")
        db.rollback()

    return response


@router.post("/regenerate", response_model=ContentGenerationResponse, status_code=status.HTTP_200_OK)
def regenerate_campaign_content(
    payload: ContentRegenerationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
):
    """Regenerate existing content with tone adjustments, length variations, or custom feedback."""
    if not payload.previous_content.strip():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Previous content is required to regenerate.")

    try:
        response = ai_service.regenerate_content(payload)
    except Exception as exc:
        logger.error(f"Content regeneration error: {str(exc)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to regenerate content. Please verify input parameters.",
        )

    # Save to history
    try:
        record = GeneratedContent(
            campaign_id=payload.campaign_id,
            prompt=f"Regeneration: {payload.campaign_name} with tone={payload.new_tone}, length={payload.new_length}",
            category="REGENERATION",
            tone=payload.new_tone or "Professional",
            language=payload.target_language,
            content_type=payload.content_type.upper(),
            headline=response.headline,
            call_to_action=response.call_to_action,
            raw_output=response.content,
            tokens_used=response.tokens_used,
            model_name=response.model_used,
            metadata_json={"regenerated_from": payload.previous_content[:100], "user": current_user.email},
        )
        db.add(record)
        db.commit()
    except Exception as db_err:
        logger.warning(f"Failed to save regenerated record: {str(db_err)}")
        db.rollback()

    return response


@router.get("/templates", response_model=List[PromptTemplateItem])
def get_prompt_templates(current_user: User = Depends(require_any_authenticated)):
    """Retrieve all supported prompt templates and campaign content types."""
    results = []
    for key, val in SUPPORTED_CONTENT_TYPES.items():
        results.append(
            PromptTemplateItem(
                key=key,
                name=val["name"],
                description=val["description"],
                default_length=val["default_length"],
            )
        )
    return results


@router.get("/config-status", response_model=AIServiceConfigStatus)
def get_ai_config_status(current_user: User = Depends(require_any_authenticated)):
    """Inspect AI service operational readiness and provider configuration securely."""
    return ai_service.get_config_status()


@router.get("/history")
def get_content_generation_history(
    campaign_id: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
):
    """Retrieve previously generated content history for campaigns."""
    query = db.query(GeneratedContent)
    if campaign_id:
        query = query.filter(GeneratedContent.campaign_id == campaign_id)

    records = query.order_by(GeneratedContent.created_at.desc()).limit(limit).all()

    return [
        {
            "id": r.id,
            "campaign_id": r.campaign_id,
            "headline": r.headline or r.prompt[:40],
            "content": r.raw_output,
            "content_type": r.content_type,
            "tone": r.tone,
            "language": r.language,
            "call_to_action": r.call_to_action,
            "model_name": r.model_name,
            "tokens_used": r.tokens_used,
            "created_at": r.created_at,
        }
        for r in records
    ]
