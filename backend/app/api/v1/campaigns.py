from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.schemas.campaign import (
    CampaignResponse,
    CampaignCreate,
    CampaignUpdate,
    CampaignApprovalRequest,
    CampaignRejectionRequest,
)
from app.crud.crud_campaign import (
    get_campaigns,
    get_campaign_by_id,
    create_campaign,
    update_draft_campaign,
    delete_draft_campaign,
    submit_campaign_for_approval,
    approve_campaign,
    reject_campaign,
    get_campaign_recipient_count,
)
from app.crud.crud_audit import log_audit_event
from app.core.permissions import (
    require_manager,
    require_communication_team,
    require_manager_or_admin,
    require_commteam_or_admin,
    require_any_authenticated,
)

router = APIRouter()


def serialize_campaign(campaign, recipient_count: int) -> dict:
    data = {
        "id": campaign.id,
        "org_id": campaign.org_id,
        "created_by": campaign.created_by,
        "creator_name": campaign.creator.full_name if campaign.creator else "Unknown",
        "title": campaign.title,
        "description": campaign.description,
        "objective": campaign.objective,
        "category": campaign.category,
        "campaign_type": campaign.campaign_type,
        "status": campaign.status,
        "target_channels": campaign.target_channels or [],
        "primary_language": campaign.primary_language,
        "target_languages": campaign.target_languages or [],
        "raw_content": campaign.raw_content,
        "proposed_delivery_date": campaign.proposed_delivery_date,
        "proposed_delivery_time": campaign.proposed_delivery_time,
        "recipient_count": recipient_count,
        "segment_ids": [ca.segment_id for ca in campaign.campaign_audiences if ca.segment_id],
        "created_at": campaign.created_at,
        "updated_at": campaign.updated_at,
        "translations": [
            {
                "id": t.id,
                "language_code": t.language_code,
                "language_name": t.language_name,
                "translated_title": t.translated_title,
                "translated_body": t.translated_body,
                "is_verified": t.is_verified,
            }
            for t in campaign.translations
        ],
        "approvals": [
            {
                "id": a.id,
                "reviewer_id": a.reviewer_id,
                "reviewer_name": a.reviewer.full_name if a.reviewer else "Unknown",
                "decision": a.decision,
                "comments": a.comments,
                "decided_at": a.decided_at,
            }
            for a in campaign.approvals
        ],
        "status_history": [
            {
                "id": h.id,
                "from_status": h.from_status,
                "to_status": h.to_status,
                "changed_by": h.changed_by,
                "reason": h.reason,
                "created_at": h.created_at,
            }
            for h in campaign.status_history
        ],
    }
    return data


@router.get("", response_model=List[CampaignResponse])
def list_campaigns(
    status: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
):
    """List campaigns with role-based scoping."""
    role_names = [r.name.upper() for r in current_user.roles]
    user_filter = None

    # Managers see only their own campaigns
    if "MANAGER" in role_names and "ADMIN" not in role_names and "COMMUNICATION_TEAM" not in role_names:
        user_filter = current_user.id

    campaigns, _ = get_campaigns(
        db=db,
        org_id=current_user.org_id,
        user_id=user_filter,
        status_filter=status,
        category_filter=category,
        search=search,
        skip=skip,
        limit=limit,
    )

    results = []
    for c in campaigns:
        cnt = get_campaign_recipient_count(db, c.id)
        results.append(serialize_campaign(c, cnt))
    return results


@router.post("", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
def create_new_campaign(
    campaign_in: CampaignCreate,
    db: Session = Depends(get_db),
    manager_user: User = Depends(require_manager_or_admin),
):
    """Manager endpoint: create a new DRAFT communication campaign."""
    campaign = create_campaign(
        db=db,
        campaign_in=campaign_in,
        org_id=manager_user.org_id,
        user_id=manager_user.id,
    )
    log_audit_event(
        db=db,
        action="CAMPAIGN_CREATE",
        resource_type="CAMPAIGN",
        user_id=manager_user.id,
        org_id=manager_user.org_id,
        resource_id=campaign.id,
        payload_after={"title": campaign.title, "status": "DRAFT"},
    )
    cnt = get_campaign_recipient_count(db, campaign.id)
    return serialize_campaign(campaign, cnt)


@router.get("/{campaign_id}", response_model=CampaignResponse)
def get_campaign(
    campaign_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
):
    """Retrieve full campaign record including translations, approvals, and status transitions."""
    campaign = get_campaign_by_id(db, campaign_id, current_user.org_id)
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")

    role_names = [r.name.upper() for r in current_user.roles]
    if "MANAGER" in role_names and "ADMIN" not in role_names and "COMMUNICATION_TEAM" not in role_names:
        if campaign.created_by != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    cnt = get_campaign_recipient_count(db, campaign.id)
    return serialize_campaign(campaign, cnt)


@router.put("/{campaign_id}", response_model=CampaignResponse)
def update_campaign(
    campaign_id: str,
    campaign_in: CampaignUpdate,
    db: Session = Depends(get_db),
    manager_user: User = Depends(require_manager_or_admin),
):
    """Manager endpoint: update draft or rejected campaign."""
    is_admin = any(r.name.upper() == "ADMIN" for r in manager_user.roles)
    updated = update_draft_campaign(
        db=db,
        campaign_id=campaign_id,
        campaign_in=campaign_in,
        org_id=manager_user.org_id,
        user_id=manager_user.id,
        is_admin=is_admin,
    )
    log_audit_event(
        db=db,
        action="CAMPAIGN_UPDATE",
        resource_type="CAMPAIGN",
        user_id=manager_user.id,
        org_id=manager_user.org_id,
        resource_id=updated.id,
    )
    cnt = get_campaign_recipient_count(db, updated.id)
    return serialize_campaign(updated, cnt)


@router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_campaign(
    campaign_id: str,
    db: Session = Depends(get_db),
    manager_user: User = Depends(require_manager_or_admin),
):
    """Manager endpoint: delete an unsubmitted DRAFT campaign."""
    is_admin = any(r.name.upper() == "ADMIN" for r in manager_user.roles)
    delete_draft_campaign(
        db=db,
        campaign_id=campaign_id,
        org_id=manager_user.org_id,
        user_id=manager_user.id,
        is_admin=is_admin,
    )
    log_audit_event(
        db=db,
        action="CAMPAIGN_DELETE",
        resource_type="CAMPAIGN",
        user_id=manager_user.id,
        org_id=manager_user.org_id,
        resource_id=campaign_id,
    )
    return None


@router.post("/{campaign_id}/submit", response_model=CampaignResponse)
def submit_campaign(
    campaign_id: str,
    db: Session = Depends(get_db),
    manager_user: User = Depends(require_manager_or_admin),
):
    """Manager endpoint: submit prepared campaign to the Communication Team for approval."""
    submitted = submit_campaign_for_approval(
        db=db,
        campaign_id=campaign_id,
        org_id=manager_user.org_id,
        user_id=manager_user.id,
    )
    log_audit_event(
        db=db,
        action="CAMPAIGN_SUBMIT_APPROVAL",
        resource_type="CAMPAIGN",
        user_id=manager_user.id,
        org_id=manager_user.org_id,
        resource_id=submitted.id,
        payload_after={"status": "PENDING_APPROVAL"},
    )
    cnt = get_campaign_recipient_count(db, submitted.id)
    return serialize_campaign(submitted, cnt)


@router.post("/{campaign_id}/approve", response_model=CampaignResponse)
def approve_campaign_endpoint(
    campaign_id: str,
    approval_req: CampaignApprovalRequest,
    db: Session = Depends(get_db),
    comm_user: User = Depends(require_commteam_or_admin),
):
    """Communication Team endpoint: verify and approve campaign for distribution."""
    approved = approve_campaign(
        db=db,
        campaign_id=campaign_id,
        reviewer_id=comm_user.id,
        comments=approval_req.comments,
        org_id=comm_user.org_id,
    )
    log_audit_event(
        db=db,
        action="CAMPAIGN_APPROVE",
        resource_type="CAMPAIGN",
        user_id=comm_user.id,
        org_id=comm_user.org_id,
        resource_id=approved.id,
        payload_after={"status": "APPROVED", "comments": approval_req.comments},
    )
    cnt = get_campaign_recipient_count(db, approved.id)
    return serialize_campaign(approved, cnt)


@router.post("/{campaign_id}/reject", response_model=CampaignResponse)
def reject_campaign_endpoint(
    campaign_id: str,
    reject_req: CampaignRejectionRequest,
    db: Session = Depends(get_db),
    comm_user: User = Depends(require_commteam_or_admin),
):
    """Communication Team endpoint: reject campaign with mandatory feedback, returning it to Manager."""
    rejected = reject_campaign(
        db=db,
        campaign_id=campaign_id,
        reviewer_id=comm_user.id,
        reason=reject_req.reason,
        org_id=comm_user.org_id,
    )
    log_audit_event(
        db=db,
        action="CAMPAIGN_REJECT",
        resource_type="CAMPAIGN",
        user_id=comm_user.id,
        org_id=comm_user.org_id,
        resource_id=rejected.id,
        payload_after={"status": "REJECTED", "reason": reject_req.reason},
    )
    cnt = get_campaign_recipient_count(db, rejected.id)
    return serialize_campaign(rejected, cnt)

