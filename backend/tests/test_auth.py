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
