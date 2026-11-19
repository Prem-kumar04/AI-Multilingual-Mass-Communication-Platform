import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal
from app.crud.crud_user import authenticate_user
from app.core.security import create_access_token
from app.services.ai_service import ai_service
from app.schemas.content_generation import ContentGenerationRequest, ContentRegenerationRequest

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


def test_ai_service_initialization_and_config():
    """Verify AI service initialized cleanly and reports status without leaking keys."""
    status_info = ai_service.get_config_status()
    assert status_info.service_initialized is True
    assert len(status_info.supported_content_types) >= 7
    assert len(status_info.supported_tones) >= 5
    # Ensure sensitive raw key is never exposed
    assert not hasattr(status_info, "api_key")


def test_get_prompt_templates(manager_token):
    """Test retrieving reusable prompt templates and supported content types."""
    res = client.get(
        "/api/v1/content-generation/templates",
        headers={"Authorization": f"Bearer {manager_token}"},
    )
    assert res.status_code == 200
    templates = res.json()
    assert isinstance(templates, list)
    keys = [t["key"] for t in templates]
    assert "EMAIL" in keys
    assert "WHATSAPP" in keys
    assert "SOCIAL_MEDIA" in keys
    assert "SMS" in keys
    assert "MARKETING_HEADLINE" in keys


def test_generate_content_validation_errors(manager_token):
    """Verify robust validation for missing or invalid inputs."""
    # 1. Missing campaign name
    res = client.post(
        "/api/v1/content-generation/generate",
        json={
            "campaign_name": "",
            "campaign_objective": "Test objective with sufficient length",
            "target_audience": "Citizens",
            "content_type": "WHATSAPP",
        },
        headers={"Authorization": f"Bearer {manager_token}"},
    )
    assert res.status_code == 422

    # 2. Unsupported content type
    res2 = client.post(
        "/api/v1/content-generation/generate",
        json={
            "campaign_name": "Valid Name",
            "campaign_objective": "Valid objective for public safety",
            "target_audience": "Citizens",
            "content_type": "INVALID_TYPE_XYZ",
        },
        headers={"Authorization": f"Bearer {manager_token}"},
    )
    assert res2.status_code == 400
    assert "Unsupported content type" in res2.json()["detail"]


def test_generate_email_campaign(manager_token):
    """Test generating email content with headline, body, and CTA."""
    payload = {
        "campaign_name": "Dengue Awareness Drive",
        "campaign_objective": "Educate low-lying urban households on water stagnation prevention",
        "target_audience": "Urban families and local communities",
        "campaign_type": "PUBLIC_AWARENESS",
        "content_type": "EMAIL",
        "preferred_tone": "Professional & Authoritative",
        "content_length": "MEDIUM",
        "variations_count": 2,
    }
    res = client.post(
        "/api/v1/content-generation/generate",
        json=payload,
        headers={"Authorization": f"Bearer {manager_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["campaign_name"] == "Dengue Awareness Drive"
    assert data["content_type"] == "EMAIL"
    assert len(data["headline"]) > 0
    assert len(data["content"]) > 0
    assert len(data["call_to_action"]) > 0
    assert len(data["variations"]) == 2
    assert data["generation_status"] in ["SUCCESS", "FALLBACK_KEY_STANDBY"]


def test_generate_whatsapp_with_variations(manager_token):
    """Test WhatsApp formatting and multiple variations generation."""
    payload = {
        "campaign_name": "Monsoon Flood Preparedness",
        "campaign_objective": "Urgent evacuation routes and emergency shelter announcements",
        "target_audience": "Coastal residents",
        "campaign_type": "EMERGENCY_ALERT",
        "content_type": "WHATSAPP",
        "preferred_tone": "Urgent / Emergency Advisory",
        "variations_count": 3,
    }
    res = client.post(
        "/api/v1/content-generation/generate",
        json=payload,
        headers={"Authorization": f"Bearer {manager_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["content_type"] == "WHATSAPP"
    assert len(data["variations"]) == 3
    for var in data["variations"]:
        assert "headline" in var
        assert "content" in var
        assert "call_to_action" in var


def test_generate_social_media_with_hashtags(manager_token):
    """Test generating social media caption with hashtags."""
    payload = {
        "campaign_name": "Say No to Single-Use Plastic",
        "campaign_objective": "Promote sustainable alternatives and cloth bags across municipal markets",
        "target_audience": "Shoppers and local business owners",
        "campaign_type": "ENVIRONMENT_CLEANLINESS",
        "content_type": "SOCIAL_MEDIA",
        "preferred_tone": "Inspiring & Uplifting",
    }
    res = client.post(
        "/api/v1/content-generation/generate",
        json=payload,
        headers={"Authorization": f"Bearer {manager_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["content_type"] == "SOCIAL_MEDIA"
    assert len(data["suggested_hashtags"]) >= 2
    assert all(tag.startswith("#") for tag in data["suggested_hashtags"])


def test_regenerate_campaign_content(manager_token):
    """Test content regeneration with tone modification and revised instructions."""
    payload = {
        "campaign_name": "Clean Air Initiative",
        "campaign_objective": "Reduce vehicular emissions in residential zones",
        "target_audience": "Daily commuters",
        "content_type": "SOCIAL_MEDIA",
        "previous_content": "Please reduce driving. Use cycles or walk when possible to prevent smog.",
        "new_tone": "Urgent / Emergency Advisory",
        "new_length": "SHORT",
        "additional_instructions": "Highlight hazardous AQI levels and emergency masks.",
        "variations_count": 2,
    }
    res = client.post(
        "/api/v1/content-generation/regenerate",
        json=payload,
        headers={"Authorization": f"Bearer {manager_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["campaign_name"] == "Clean Air Initiative"
    assert data["tone"] == "Urgent / Emergency Advisory"
    assert len(data["content"]) > 0
    assert len(data["variations"]) == 2


def test_content_history(manager_token):
    """Test retrieving history of generated content."""
    res = client.get(
        "/api/v1/content-generation/history?limit=10",
        headers={"Authorization": f"Bearer {manager_token}"},
    )
    assert res.status_code == 200
    records = res.json()
    assert isinstance(records, list)
    assert len(records) > 0
