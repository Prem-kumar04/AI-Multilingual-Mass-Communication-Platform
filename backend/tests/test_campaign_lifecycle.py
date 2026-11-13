import pytest
from app.database.session import SessionLocal
from app.crud.crud_user import authenticate_user
from app.crud.crud_campaign import (
    create_campaign,
    update_draft_campaign,
    submit_campaign_for_approval,
    approve_campaign,
    reject_campaign,
)
from app.schemas.campaign import CampaignCreate, CampaignUpdate


@pytest.fixture
def db():
    session = SessionLocal()
    yield session
    session.close()


def test_full_campaign_state_machine_and_versioning(db):
    manager = authenticate_user(db, "manager@commplatform.gov.in", "Manager@12345")
    commteam = authenticate_user(db, "commteam@commplatform.gov.in", "CommTeam@12345")

    # 1. Manager creates draft
    c_in = CampaignCreate(
        title="Cyclone Montha Warning",
        objective="Issue immediate coastal evacuation advisory",
        category="Emergency Alerts",
        target_channels=["WHATSAPP", "SMS"],
        primary_language="English",
        target_languages=["Telugu", "Tamil"],
        raw_content="URGENT: Cyclone Montha to make landfall in 24 hours. Move to designated storm shelters.",
    )
    campaign = create_campaign(db, c_in, org_id=manager.org_id, user_id=manager.id)
    assert campaign.status == "DRAFT"

    # 2. Manager edits draft
    update_in = CampaignUpdate(raw_content="UPDATED: Cyclone Montha to make landfall in 18 hours. Emergency helpline 1070 active.")
    updated = update_draft_campaign(db, campaign.id, update_in, manager.org_id, manager.id)
    assert "1070 active" in updated.raw_content

    # 3. Manager submits for approval
    submitted = submit_campaign_for_approval(db, campaign.id, manager.org_id, manager.id)
    assert submitted.status == "PENDING_APPROVAL"

    # 4. Comm Team rejects with reason
    rejected = reject_campaign(
        db,
        campaign.id,
        reviewer_id=commteam.id,
        reason="Please add shelter location URL and broadcast frequency.",
        org_id=manager.org_id,
    )
    assert rejected.status == "REJECTED"
    assert len(rejected.approvals) == 1
    assert rejected.approvals[0].decision == "REJECTED"

    # 5. Manager corrects and resubmits
    corrected = update_draft_campaign(
        db,
        campaign.id,
        CampaignUpdate(raw_content="CORRECTED: Cyclone Montha warning. Shelters: ndma.gov.in/shelters. Helpline 1070."),
        manager.org_id,
        manager.id,
    )
    resubmitted = submit_campaign_for_approval(db, campaign.id, manager.org_id, manager.id)
    assert resubmitted.status == "PENDING_APPROVAL"

    # 6. Comm Team approves
    approved = approve_campaign(
        db,
        campaign.id,
        reviewer_id=commteam.id,
        comments="Editorial and disaster relief clearance verified.",
        org_id=manager.org_id,
    )
    assert approved.status == "APPROVED"
    assert len(approved.versions) >= 1
    assert len(approved.versions[0].content_hash) == 64
