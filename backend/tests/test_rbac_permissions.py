import pytest
from app.database.session import SessionLocal
from app.crud.crud_user import authenticate_user


@pytest.fixture
def db():
    session = SessionLocal()
    yield session
    session.close()


def test_admin_has_admin_role_and_permissions(db):
    admin = authenticate_user(db, "admin@commplatform.gov.in", "Admin@12345")
    role_names = [r.name for r in admin.roles]
    assert "ADMIN" in role_names
    perm_codes = {p.code for r in admin.roles for p in r.permissions}
    assert "users:create" in perm_codes
    assert "roles:manage" in perm_codes
    assert "audit:read" in perm_codes


def test_manager_has_campaign_authoring_permissions_only(db):
    manager = authenticate_user(db, "manager@commplatform.gov.in", "Manager@12345")
    role_names = [r.name for r in manager.roles]
    assert "MANAGER" in role_names
    assert "ADMIN" not in role_names
    assert "COMMUNICATION_TEAM" not in role_names

    perm_codes = {p.code for r in manager.roles for p in r.permissions}
    assert "campaigns:create" in perm_codes
    assert "campaigns:submit" in perm_codes
    assert "campaigns:approve" not in perm_codes
    assert "campaigns:distribute" not in perm_codes
    assert "users:create" not in perm_codes


def test_commteam_has_approval_and_distribution_permissions_only(db):
    comm = authenticate_user(db, "commteam@commplatform.gov.in", "CommTeam@12345")
    role_names = [r.name for r in comm.roles]
    assert "COMMUNICATION_TEAM" in role_names
    assert "MANAGER" not in role_names
    assert "ADMIN" not in role_names

    perm_codes = {p.code for r in comm.roles for p in r.permissions}
    assert "campaigns:approve" in perm_codes
    assert "campaigns:reject" in perm_codes
    assert "campaigns:distribute" in perm_codes
    assert "campaigns:create" not in perm_codes
    assert "users:create" not in perm_codes
