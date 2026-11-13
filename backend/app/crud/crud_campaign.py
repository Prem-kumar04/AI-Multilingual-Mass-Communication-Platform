import hashlib
import json
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.models.campaign import (
    Campaign,
    CampaignVersion,
    CampaignApproval,
    CampaignStatusHistory,
)
from app.models.audience import CampaignAudience, AudienceSegment, AudienceContact
from app.schemas.campaign import CampaignCreate, CampaignUpdate


def compute_content_hash(content: str, translations: List[dict]) -> str:
    """Calculate deterministic SHA-256 checksum of campaign payload."""
    payload = {
        "content": content or "",
        "translations": sorted(translations, key=lambda x: x.get("language_code", "")),
    }
    encoded = json.dumps(payload, sort_keys=True).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def get_campaign_recipient_count(db: Session, campaign_id: str) -> int:
    """Calculate unique recipient count from attached segments and individual contacts."""
    links = db.query(CampaignAudience).filter(CampaignAudience.campaign_id == campaign_id).all()
    contact_ids = set()
    for link in links:
        if link.contact_id:
            contact_ids.add(link.contact_id)
        elif link.segment_id:
            segment = db.query(AudienceSegment).filter(AudienceSegment.id == link.segment_id).first()
            if segment:
                # Query matching subscribed contacts for this segment
                query = db.query(AudienceContact.id).filter(
                    AudienceContact.org_id == segment.org_id,
                    AudienceContact.is_subscribed == True,
                )
                crit = segment.filter_criteria or {}
                if crit.get("languages"):
                    query = query.filter(AudienceContact.preferred_language.in_(crit["languages"]))
                if crit.get("states"):
                    query = query.filter(AudienceContact.location_state.in_(crit["states"]))
                if crit.get("age_groups"):
                    query = query.filter(AudienceContact.age_group.in_(crit["age_groups"]))
                for row in query.all():
                    contact_ids.add(row[0])
    return len(contact_ids)


def get_campaigns(
    db: Session,
    org_id: str,
    user_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    category_filter: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> Tuple[List[Campaign], int]:
    query = (
        db.query(Campaign)
        .options(
            joinedload(Campaign.creator),
            joinedload(Campaign.translations),
            joinedload(Campaign.approvals).joinedload(CampaignApproval.reviewer),
            joinedload(Campaign.status_history),
            joinedload(Campaign.campaign_audiences),
        )
        .filter(Campaign.org_id == org_id)
    )

    if user_id:
        query = query.filter(Campaign.created_by == user_id)
    if status_filter:
        query = query.filter(Campaign.status == status_filter.upper())
    if category_filter:
        query = query.filter(Campaign.category.ilike(f"%{category_filter.strip()}%"))
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(Campaign.title.ilike(s) | Campaign.description.ilike(s))

    total = query.count()
    campaigns = query.order_by(Campaign.created_at.desc()).offset(skip).limit(limit).all()
    return campaigns, total


def get_campaign_by_id(db: Session, campaign_id: str, org_id: str) -> Optional[Campaign]:
    return (
        db.query(Campaign)
        .options(
            joinedload(Campaign.creator),
            joinedload(Campaign.translations),
            joinedload(Campaign.approvals).joinedload(CampaignApproval.reviewer),
            joinedload(Campaign.status_history),
            joinedload(Campaign.campaign_audiences),
        )
        .filter(Campaign.id == campaign_id, Campaign.org_id == org_id)
        .first()
    )


def create_campaign(db: Session, campaign_in: CampaignCreate, org_id: str, user_id: str) -> Campaign:
    campaign = Campaign(
        org_id=org_id,
        created_by=user_id,
        title=campaign_in.title,
        description=campaign_in.description,
        objective=campaign_in.objective,
        category=campaign_in.category,
        campaign_type=campaign_in.campaign_type,
        status="DRAFT",
        target_channels=campaign_in.target_channels,
        primary_language=campaign_in.primary_language,
        target_languages=campaign_in.target_languages,
        raw_content=campaign_in.raw_content,
        proposed_delivery_date=campaign_in.proposed_delivery_date,
        proposed_delivery_time=campaign_in.proposed_delivery_time,
    )
    db.add(campaign)
    db.flush()

    # Link audience segments
    for seg_id in campaign_in.segment_ids:
        ca = CampaignAudience(campaign_id=campaign.id, segment_id=seg_id)
        db.add(ca)

    # Link individual contacts
    for c_id in campaign_in.contact_ids:
        ca = CampaignAudience(campaign_id=campaign.id, contact_id=c_id)
        db.add(ca)

    # Initial status history record
    history = CampaignStatusHistory(
        campaign_id=campaign.id,
        from_status="NONE",
        to_status="DRAFT",
        changed_by=user_id,
        reason="Campaign created as DRAFT.",
    )
    db.add(history)

    db.commit()
    return get_campaign_by_id(db, campaign.id, org_id)


def update_draft_campaign(
    db: Session,
    campaign_id: str,
    campaign_in: CampaignUpdate,
    org_id: str,
    user_id: str,
    is_admin: bool = False,
) -> Campaign:
    campaign = get_campaign_by_id(db, campaign_id, org_id)
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")

    # Only DRAFT or REJECTED campaigns may be modified by Managers
    if campaign.status not in ["DRAFT", "REJECTED"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot edit campaign in '{campaign.status}' status. Only DRAFT or REJECTED campaigns can be edited.",
        )

    # Managers can only edit their own campaigns
    if not is_admin and campaign.created_by != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to edit this campaign.",
        )

    for field, val in campaign_in.model_dump(exclude_unset=True).items():
        if field not in ["segment_ids", "contact_ids"] and val is not None:
            setattr(campaign, field, val)

    if campaign_in.segment_ids is not None or campaign_in.contact_ids is not None:
        db.query(CampaignAudience).filter(CampaignAudience.campaign_id == campaign_id).delete()
        if campaign_in.segment_ids:
            for s_id in campaign_in.segment_ids:
                db.add(CampaignAudience(campaign_id=campaign_id, segment_id=s_id))
        if campaign_in.contact_ids:
            for c_id in campaign_in.contact_ids:
                db.add(CampaignAudience(campaign_id=campaign_id, contact_id=c_id))

    db.commit()
    return get_campaign_by_id(db, campaign_id, org_id)


def delete_draft_campaign(
    db: Session,
    campaign_id: str,
    org_id: str,
    user_id: str,
    is_admin: bool = False,
) -> bool:
    campaign = get_campaign_by_id(db, campaign_id, org_id)
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")

    if campaign.status != "DRAFT":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only DRAFT campaigns can be deleted. Current status: '{campaign.status}'.",
        )

    if not is_admin and campaign.created_by != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own draft campaigns.",
        )

    db.delete(campaign)
    db.commit()
    return True


def submit_campaign_for_approval(
    db: Session,
    campaign_id: str,
    org_id: str,
    user_id: str,
) -> Campaign:
    campaign = get_campaign_by_id(db, campaign_id, org_id)
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")

    if campaign.status not in ["DRAFT", "REJECTED"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Campaign is in '{campaign.status}' state and cannot be submitted.",
        )

    # Mandatory submission validations
    if not campaign.title or not campaign.title.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Campaign title is required")
    if not campaign.objective or not campaign.objective.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Campaign objective is required")
    if not campaign.raw_content or not campaign.raw_content.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Campaign content is required before submission")
    if not campaign.target_channels or len(campaign.target_channels) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one target communication channel must be selected")

    prev_status = campaign.status
    campaign.status = "PENDING_APPROVAL"

    history = CampaignStatusHistory(
        campaign_id=campaign.id,
        from_status=prev_status,
        to_status="PENDING_APPROVAL",
        changed_by=user_id,
        reason="Submitted by Manager for Communication Team review.",
    )
    db.add(history)
    db.commit()
    return get_campaign_by_id(db, campaign.id, org_id)


def approve_campaign(
    db: Session,
    campaign_id: str,
    reviewer_id: str,
    comments: Optional[str],
    org_id: str,
) -> Campaign:
    campaign = get_campaign_by_id(db, campaign_id, org_id)
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")

    if campaign.status != "PENDING_APPROVAL":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only campaigns in 'PENDING_APPROVAL' state can be approved. Current status: '{campaign.status}'.",
        )

    # Record approval decision
    approval = CampaignApproval(
        campaign_id=campaign.id,
        reviewer_id=reviewer_id,
        decision="APPROVED",
        comments=comments or "Approved after verification.",
    )
    db.add(approval)

    # Create immutable version snapshot with content hash
    translations_data = [
        {"language_code": t.language_code, "translated_body": t.translated_body}
        for t in campaign.translations
    ]
    c_hash = compute_content_hash(campaign.raw_content, translations_data)
    ver_count = db.query(CampaignVersion).filter(CampaignVersion.campaign_id == campaign.id).count()

    version = CampaignVersion(
        campaign_id=campaign.id,
        version_number=ver_count + 1,
        raw_content=campaign.raw_content or "",
        content_hash=c_hash,
        content_snapshot={
            "title": campaign.title,
            "category": campaign.category,
            "channels": campaign.target_channels,
            "translations": translations_data,
        },
        created_by=reviewer_id,
    )
    db.add(version)

    prev_status = campaign.status
    campaign.status = "APPROVED"

    history = CampaignStatusHistory(
        campaign_id=campaign.id,
        from_status=prev_status,
        to_status="APPROVED",
        changed_by=reviewer_id,
        reason=f"Approved by Communication Team: {comments or 'Verification passed.'}",
    )
    db.add(history)
    db.commit()
    return get_campaign_by_id(db, campaign.id, org_id)


def reject_campaign(
    db: Session,
    campaign_id: str,
    reviewer_id: str,
    reason: str,
    org_id: str,
) -> Campaign:
    campaign = get_campaign_by_id(db, campaign_id, org_id)
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")

    if campaign.status != "PENDING_APPROVAL":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only campaigns in 'PENDING_APPROVAL' state can be rejected. Current status: '{campaign.status}'.",
        )

    if not reason or not reason.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rejection reason is mandatory when returning a campaign.",
        )

    # Record rejection
    approval = CampaignApproval(
        campaign_id=campaign.id,
        reviewer_id=reviewer_id,
        decision="REJECTED",
        comments=reason.strip(),
    )
    db.add(approval)

    prev_status = campaign.status
    campaign.status = "REJECTED"

    history = CampaignStatusHistory(
        campaign_id=campaign.id,
        from_status=prev_status,
        to_status="REJECTED",
        changed_by=reviewer_id,
        reason=f"Returned with feedback: {reason.strip()}",
    )
    db.add(history)
    db.commit()
    return get_campaign_by_id(db, campaign.id, org_id)

