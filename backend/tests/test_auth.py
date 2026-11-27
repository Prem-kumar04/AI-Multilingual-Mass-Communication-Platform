import pytest
from app.database.session import SessionLocal
from app.crud.crud_user import authenticate_user
from app.core.security import create_access_token, decode_access_token


@pytest.fixture
def db():
    session = SessionLocal()
    yield session
    session.close()


def test_admin_authentication(db):
    user = authenticate_user(db, "admin@commplatform.gov.in", "Admin@12345")
    assert user is not None
    assert user.email == "admin@commplatform.gov.in"
    roles = [r.name for r in user.roles]
    assert "ADMIN" in roles


def test_manager_authentication(db):
    user = authenticate_user(db, "manager@commplatform.gov.in", "Manager@12345")
    assert user is not None
    assert user.email == "manager@commplatform.gov.in"
    roles = [r.name for r in user.roles]
    assert "MANAGER" in roles


def test_commteam_authentication(db):
    user = authenticate_user(db, "commteam@commplatform.gov.in", "CommTeam@12345")
    assert user is not None
    assert user.email == "commteam@commplatform.gov.in"
    roles = [r.name for r in user.roles]
    assert "COMMUNICATION_TEAM" in roles


def test_invalid_password(db):
    user = authenticate_user(db, "admin@commplatform.gov.in", "WrongPassword123")
    assert user is None


def test_jwt_token_generation_and_decode(db):
    user = authenticate_user(db, "admin@commplatform.gov.in", "Admin@12345")
    token = create_access_token(subject=user.id)
    payload = decode_access_token(token)
    assert payload is not None
    assert payload.get("sub") == user.id


def test_refresh_token_generation_and_decode(db):
    from app.core.security import create_refresh_token, decode_refresh_token
    user = authenticate_user(db, "admin@commplatform.gov.in", "Admin@12345")
    refresh_token = create_refresh_token(subject=user.id)
    payload = decode_refresh_token(refresh_token)
    assert payload is not None
    assert payload.get("sub") == user.id
    assert payload.get("type") == "refresh"


def test_login_sets_cookies_and_refresh_endpoints():
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)
    # Login
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@commplatform.gov.in", "password": "Admin@12345"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["refresh_token"] is not None

    # Check cookies returned in response
    assert "access_token" in res.cookies
    assert "refresh_token" in res.cookies

    # Refresh using body
    ref_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": data["refresh_token"]},
    )
    assert ref_res.status_code == 200
    ref_data = ref_res.json()
    assert "access_token" in ref_data
    assert "refresh_token" in ref_data

    # Refresh using cookie
    cookie_ref_res = client.post(
        "/api/v1/auth/refresh",
        cookies={"refresh_token": data["refresh_token"]},
    )
    assert cookie_ref_res.status_code == 200
    assert "access_token" in cookie_ref_res.cookies

    # Logout clears cookies
    logout_res = client.post("/api/v1/auth/logout")
    assert logout_res.status_code == 200

