from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.core.permissions import require_any_authenticated
from app.schemas.translation import (
    SupportedLanguageItem,
    TranslateTextRequest,
    TranslationItemResponse,
    CampaignTranslationGenerateRequest,
    TranslationReviewRequest,
)
from app.services.translation_service import translation_service
from app.models.content import CampaignTranslation
from app.crud.crud_audit import log_audit_event

router = APIRouter()


@router.get("/languages", response_model=List[SupportedLanguageItem])
def get_supported_languages(
    current_user: User = Depends(require_any_authenticated),
):
    """Retrieve all supported Indian regional languages, scripts, and geographical areas."""
    return translation_service.get_supported_languages()


@router.post("/translate", response_model=TranslationItemResponse)
def translate_content(
    payload: TranslateTextRequest,
    current_user: User = Depends(require_any_authenticated),
):
    """On-the-fly multilingual translation returning both original and translated text with cultural notes."""
    result = translation_service.translate_text(
        text=payload.text,
        target_language=payload.target_language,
        source_language=payload.source_language,
        title=payload.title,
        context=payload.context or "Public Civic Awareness",
    )
    return result


@router.post("/campaign/{campaign_id}/generate", response_model=List[TranslationItemResponse])
def generate_campaign_translations(
    campaign_id: str,
    payload: Optional[CampaignTranslationGenerateRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
):
    """Translate all campaign target regional languages and persist records to the database."""
    target_langs = payload.target_languages if payload else None
    try:
        results = translation_service.translate_campaign(
            db=db,
            campaign_id=campaign_id,
            target_languages=target_langs,
            user_id=current_user.id,
        )
        log_audit_event(
            db=db,
            action="TRANSLATIONS_GENERATED",
            resource_type="CAMPAIGN_TRANSLATION",
            user_id=current_user.id,
            org_id=current_user.org_id,
            resource_id=campaign_id,
            payload_after={"languages_count": len(results)},
        )
        return results
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Translation generation failed: {str(e)}")


@router.get("/campaign/{campaign_id}", response_model=List[TranslationItemResponse])
def list_campaign_translations(
    campaign_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
):
    """Retrieve all stored translations for a campaign with verification statuses and reviewer notes."""
    records = (
        db.query(CampaignTranslation)
        .filter(CampaignTranslation.campaign_id == campaign_id)
        .order_by(CampaignTranslation.language_name.asc())
        .all()
    )
    return [
        TranslationItemResponse(
            id=r.id,
            language_code=r.language_code,
            language_name=r.language_name,
            original_text=r.original_text or "",
            translated_title=r.translated_title,
            translated_body=r.translated_body,
            cultural_notes=r.cultural_notes,
            is_verified=r.is_verified,
            verified_by=r.verified_by,
            reviewer_notes=r.reviewer_notes,
            created_at=r.created_at,
            updated_at=r.updated_at,
        )
        for r in records
    ]


@router.put("/{translation_id}/review", response_model=TranslationItemResponse)
def review_translation_endpoint(
    translation_id: str,
    payload: TranslationReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
):
    """Communication Team / Admin endpoint to certify, edit, and verify translation accuracy."""
    try:
        updated = translation_service.review_translation(
            db=db,
            translation_id=translation_id,
            is_verified=payload.is_verified,
            user_id=current_user.id,
            edited_title=payload.edited_title,
            edited_body=payload.edited_body,
            reviewer_notes=payload.reviewer_notes,
        )
        log_audit_event(
            db=db,
            action="TRANSLATION_REVIEWED",
            resource_type="CAMPAIGN_TRANSLATION",
            user_id=current_user.id,
            org_id=current_user.org_id,
            resource_id=translation_id,
            payload_after={"is_verified": payload.is_verified},
        )
        return updated
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Review update failed: {str(e)}")

