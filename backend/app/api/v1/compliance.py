from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.core.permissions import require_any_authenticated
from app.schemas.compliance import (
    ComplianceRuleItem,
    ContentQualityCheckRequest,
    ContentQualityReportResponse,
)
from app.services.compliance_service import compliance_service
from app.crud.crud_audit import log_audit_event

router = APIRouter()


@router.get("/rules", response_model=List[ComplianceRuleItem])
def get_compliance_rules(
    current_user: User = Depends(require_any_authenticated),
):
    """Retrieve all active civic compliance policies, PII rules, and quality thresholds."""
    return compliance_service.get_compliance_rules()


@router.post("/check", response_model=ContentQualityReportResponse)
def check_content_quality(
    payload: ContentQualityCheckRequest,
    current_user: User = Depends(require_any_authenticated),
):
    """Run real-time multi-factor content quality and compliance audit on any message."""
    return compliance_service.validate_content(
        text=payload.text,
        title=payload.title,
        category=payload.category,
        is_emergency=payload.is_emergency,
    )


@router.post("/campaign/{campaign_id}/validate", response_model=ContentQualityReportResponse)
def validate_campaign_endpoint(
    campaign_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
):
    """Run full compliance audit on campaign and attach verified report to campaign records."""
    try:
        report = compliance_service.validate_campaign(
            db=db,
            campaign_id=campaign_id,
            user_id=current_user.id,
        )
        log_audit_event(
            db=db,
            action="CAMPAIGN_COMPLIANCE_AUDITED",
            resource_type="CAMPAIGN_QUALITY_REPORT",
            user_id=current_user.id,
            org_id=current_user.org_id,
            resource_id=campaign_id,
            payload_after={
                "compliance_status": report.compliance_status,
                "compliance_score": report.compliance_score,
                "clarity_score": report.clarity_score,
            },
        )
        return report
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Compliance check failed: {str(e)}")


@router.get("/campaign/{campaign_id}/report", response_model=Optional[ContentQualityReportResponse])
def get_campaign_quality_report(
    campaign_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
):
    """Retrieve the latest quality and compliance clearance report for a campaign."""
    report = compliance_service.get_latest_campaign_report(db=db, campaign_id=campaign_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No quality report found for this campaign")
    return report

