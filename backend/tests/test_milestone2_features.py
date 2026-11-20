import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal
from app.crud.crud_user import authenticate_user
from app.core.security import create_access_token
from app.models.campaign import Campaign
from app.models.content import CampaignTranslation, CampaignQualityReport

client = TestClient(app)


@pytest.fixture
def manager_token():
    db = SessionLocal()
    try:
        user = authenticate_user(db, "manager@commplatform.gov.in", "Manager@12345")
        if not user:
            user = authenticate_user(db, "manager@example.com", "vtu23012")
        assert user is not None, "Manager user must exist"
        token = create_access_token(user.id)
        return token
    finally:
        db.close()


@pytest.fixture
def commteam_token():
    db = SessionLocal()
    try:
        user = authenticate_user(db, "commteam@commplatform.gov.in", "CommTeam@12345")
        if not user:
            user = authenticate_user(db, "reviewer@commplatform.gov.in", "Reviewer@12345")
        assert user is not None, "Comm team user must exist"
        token = create_access_token(user.id)
        return token
    finally:
        db.close()


@pytest.fixture
def sample_campaign(manager_token):
    res = client.post(
        "/api/v1/campaigns",
        headers={"Authorization": f"Bearer {manager_token}"},
        json={
            "title": "Monsoon Vector Disease Prevention Drive",
            "objective": "Urge residents to inspect flowerpots and drains to stop mosquito breeding.",
            "category": "Public Awareness",
            "campaign_type": "PUBLIC_AWARENESS",
            "target_channels": ["WHATSAPP", "SMS"],
            "primary_language": "English",
            "target_languages": ["Telugu", "Hindi"],
            "raw_content": "Notice: Stagnant water around homes is the leading cause of dengue. Empty all containers this Sunday. National Health Helpline 1075 is available 24x7.",
        },
    )
    assert res.status_code == 201
    return res.json()


# ==========================================
# Task 1: Multilingual Translation Engine Tests
# ==========================================

def test_get_supported_indian_languages(manager_token):
    """Test retrieving supported Indian languages with scripts and regional details."""
    res = client.get(
        "/api/v1/translations/languages",
        headers={"Authorization": f"Bearer {manager_token}"},
    )
    assert res.status_code == 200
    languages = res.json()
    codes = [l["code"] for l in languages]
    assert "te" in codes
    assert "hi" in codes
    assert "ta" in codes
    assert "kn" in codes
    assert "bn" in codes


def test_translate_text_dual_version(manager_token):
    """Test translating original content into Telugu and Hindi with both versions returned."""
    res = client.post(
        "/api/v1/translations/translate",
        headers={"Authorization": f"Bearer {manager_token}"},
        json={
            "text": "Stagnant water causes vector breeding. Please clean water tanks.",
            "target_language": "Telugu",
            "title": "Dengue Prevention Campaign",
            "source_language": "English",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["language_code"] == "te"
    assert data["original_text"] == "Stagnant water causes vector breeding. Please clean water tanks."
    assert data["translated_body"] is not None
    assert len(data["translated_body"]) > 5
    assert data["cultural_notes"] is not None


def test_campaign_batch_translation_and_review(manager_token, commteam_token, sample_campaign):
    """Test generating translations for a campaign and performing human review verification."""
    campaign_id = sample_campaign["id"]

    # 1. Generate translations
    res = client.post(
        f"/api/v1/translations/campaign/{campaign_id}/generate",
        headers={"Authorization": f"Bearer {manager_token}"},
        json={"target_languages": ["Telugu", "Hindi"]},
    )
    assert res.status_code == 200
    translations = res.json()
    assert len(translations) >= 2

    # Verify both translations are stored
    te_trans = next(t for t in translations if t["language_code"] == "te")
    assert te_trans["is_verified"] is False
    assert te_trans["original_text"] is not None

    # 2. Review and verify translation as Communication Team reviewer
    review_res = client.put(
        f"/api/v1/translations/{te_trans['id']}/review",
        headers={"Authorization": f"Bearer {commteam_token}"},
        json={
            "is_verified": True,
            "edited_title": "డెంగ్యూ నివారణ ప్రచారం (ప్రజా సమాచారం)",
            "reviewer_notes": "Linguistic verification approved. Accurate terminology for regional broadcast.",
        },
    )
    assert review_res.status_code == 200
    reviewed_data = review_res.json()
    assert reviewed_data["is_verified"] is True
    assert reviewed_data["reviewer_notes"] is not None
    assert "డెంగ్యూ" in reviewed_data["translated_title"]


# ==========================================
# Task 2: Audience Personalization & Sentiment Tests
# ==========================================

def test_sentiment_analysis(manager_token):
    """Test sentiment polarity, empathy score, and tone improvement suggestions."""
    res = client.post(
        "/api/v1/optimization/analyze-sentiment",
        headers={"Authorization": f"Bearer {manager_token}"},
        json={
            "text": "URGENT ALERT: Heavy rainfall predicted. Evacuate low-lying areas immediately. Call helpline 112 for disaster relief.",
            "campaign_name": "Flood Safety Alert",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["polarity"] in ("URGENT_ALERT", "POSITIVE", "NEUTRAL")
    assert 0 <= data["empathy_score"] <= 100
    assert 0 <= data["clarity_score"] <= 100
    assert len(data["tone_improvement_suggestions"]) > 0


def test_audience_personalization_side_by_side(manager_token):
    """Test audience personalization for Rural Citizens and Elderly Pensioners with side-by-side diff."""
    original_text = "Notice: The statutory mandate requires all persons to operationalize water cleanliness forthwith to mitigate vector proliferation."

    res = client.post(
        "/api/v1/optimization/personalize",
        headers={"Authorization": f"Bearer {manager_token}"},
        json={
            "text": original_text,
            "title": "Clean Water Directive",
            "target_audience": "RURAL_CITIZENS",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["target_audience"] == "RURAL_CITIZENS"
    assert data["original_content"] == original_text
    assert data["optimized_content"] != original_text
    assert len(data["changes_made"]) > 0
    assert "sentiment_before" in data
    assert "sentiment_after" in data
    assert data["sentiment_after"]["clarity_score"] >= data["sentiment_before"]["clarity_score"]


def test_campaign_personalization_variants(manager_token, sample_campaign):
    """Test generating and retrieving personalized campaign variants for multiple demographic segments."""
    campaign_id = sample_campaign["id"]
    res = client.post(
        f"/api/v1/optimization/campaign/{campaign_id}/personalize",
        headers={"Authorization": f"Bearer {manager_token}"},
        json={"target_segments": ["RURAL_CITIZENS", "ELDERLY_PENSIONERS"]},
    )
    assert res.status_code == 200
    variants = res.json()
    assert len(variants) == 2

    # Retrieve stored variants
    get_res = client.get(
        f"/api/v1/optimization/campaign/{campaign_id}/variants",
        headers={"Authorization": f"Bearer {manager_token}"},
    )
    assert get_res.status_code == 200
    stored = get_res.json()
    assert len(stored) >= 2


# ==========================================
# Task 3: Quality & Compliance Review Tests
# ==========================================

def test_content_quality_check_compliant(manager_token):
    """Test quality check on standard compliant civic broadcast."""
    res = client.post(
        "/api/v1/compliance/check",
        headers={"Authorization": f"Bearer {manager_token}"},
        json={
            "title": "Free Public Health Checkup Drive",
            "text": "Municipal Health Department announces free health screenings this Saturday at all ward centers. For appointments, call toll-free helpline 1075.",
            "category": "Public Awareness",
        },
    )
    assert res.status_code == 200
    report = res.json()
    assert report["compliance_status"] in ("COMPLIANT", "NEEDS_REVIEW")
    assert report["clarity_score"] >= 70
    assert report["readability_score"] >= 70


def test_compliance_flags_pii_violation(manager_token):
    """Test compliance validation flags exposed Aadhaar number as CRITICAL."""
    res = client.post(
        "/api/v1/compliance/check",
        headers={"Authorization": f"Bearer {manager_token}"},
        json={
            "title": "Beneficiary List",
            "text": "Beneficiary citizen approved with Aadhaar number 5432 9876 1234. Please collect funds.",
            "category": "Government Policy",
        },
    )
    assert res.status_code == 200
    report = res.json()
    assert report["compliance_status"] == "NON_COMPLIANT"
    pii_flags = [f for f in report["flags"] if f["rule"] == "PII_PROTECTION"]
    assert len(pii_flags) > 0
    assert pii_flags[0]["severity"] == "CRITICAL"


def test_compliance_flags_political_bias(manager_token):
    """Test compliance validation flags partisan election slogans in civic notices."""
    res = client.post(
        "/api/v1/compliance/check",
        headers={"Authorization": f"Bearer {manager_token}"},
        json={
            "title": "Civic Notice",
            "text": "Road construction completed. Vote for candidate Sharma at the upcoming election rally.",
            "category": "Public Awareness",
        },
    )
    assert res.status_code == 200
    report = res.json()
    assert report["compliance_status"] == "NON_COMPLIANT"
    pol_flags = [f for f in report["flags"] if f["rule"] == "CIVIC_NEUTRALITY"]
    assert len(pol_flags) > 0


def test_campaign_quality_validation_and_audit(manager_token, sample_campaign):
    """Test validating a campaign, persisting its quality report, and retrieving it."""
    campaign_id = sample_campaign["id"]
    res = client.post(
        f"/api/v1/compliance/campaign/{campaign_id}/validate",
        headers={"Authorization": f"Bearer {manager_token}"},
    )
    assert res.status_code == 200
    report = res.json()
    assert report["campaign_id"] == campaign_id
    assert report["clarity_score"] > 0

    # Retrieve report
    get_res = client.get(
        f"/api/v1/compliance/campaign/{campaign_id}/report",
        headers={"Authorization": f"Bearer {manager_token}"},
    )
    assert get_res.status_code == 200
    assert get_res.json()["id"] == report["id"]


# ==========================================
# End-to-End Workflow Integration Test
# ==========================================

def test_complete_end_to_end_ai_workflow(manager_token, commteam_token):
    """
    Test complete lifecycle:
    1. Manager authors campaign draft.
    2. Manager generates translations for Telugu and Hindi.
    3. Manager runs audience personalization for Rural Citizens.
    4. Manager runs AI compliance audit.
    5. Manager submits campaign for review.
    6. Communication Team inspects compliance report, verifies translation, and approves campaign!
    """
    # 1. Author Campaign
    create_res = client.post(
        "/api/v1/campaigns",
        headers={"Authorization": f"Bearer {manager_token}"},
        json={
            "title": "National Pulse Polio Immunization Day",
            "objective": "Ensure all children under 5 receive polio drops on Sunday.",
            "category": "Healthcare Announcements",
            "campaign_type": "PUBLIC_AWARENESS",
            "target_channels": ["WHATSAPP", "SMS"],
            "primary_language": "English",
            "target_languages": ["Telugu", "Hindi"],
            "raw_content": "Immunize every child under 5 this Sunday at your nearest health post. Protect India from Polio. National Helpline 1075 is available 24x7.",
        },
    )
    assert create_res.status_code == 201
    campaign = create_res.json()
    cid = campaign["id"]

    # 2. Multilingual Translation
    trans_res = client.post(
        f"/api/v1/translations/campaign/{cid}/generate",
        headers={"Authorization": f"Bearer {manager_token}"},
        json={"target_languages": ["Telugu", "Hindi"]},
    )
    assert trans_res.status_code == 200
    translations = trans_res.json()
    assert len(translations) == 2

    # 3. Audience Personalization
    pers_res = client.post(
        f"/api/v1/optimization/campaign/{cid}/personalize",
        headers={"Authorization": f"Bearer {manager_token}"},
        json={"target_segments": ["RURAL_CITIZENS"]},
    )
    assert pers_res.status_code == 200

    # 4. Compliance & Quality Check
    comp_res = client.post(
        f"/api/v1/compliance/campaign/{cid}/validate",
        headers={"Authorization": f"Bearer {manager_token}"},
    )
    assert comp_res.status_code == 200
    assert comp_res.json()["compliance_status"] == "COMPLIANT"

    # 5. Submit for Approval
    submit_res = client.post(
        f"/api/v1/campaigns/{cid}/submit",
        headers={"Authorization": f"Bearer {manager_token}"},
    )
    assert submit_res.status_code == 200
    assert submit_res.json()["status"] == "PENDING_APPROVAL"

    # 6. Reviewer verifies translation and approves
    te_trans_id = translations[0]["id"]
    verify_res = client.put(
        f"/api/v1/translations/{te_trans_id}/review",
        headers={"Authorization": f"Bearer {commteam_token}"},
        json={"is_verified": True, "reviewer_notes": "Verified against state medical guidelines."},
    )
    assert verify_res.status_code == 200

    approve_res = client.post(
        f"/api/v1/campaigns/{cid}/approve",
        headers={"Authorization": f"Bearer {commteam_token}"},
        json={"comments": "Quality score 92+. All regional translations certified. Cleared for distribution."},
    )
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "APPROVED"
