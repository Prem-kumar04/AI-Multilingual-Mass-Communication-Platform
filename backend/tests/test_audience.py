import pytest
from app.database.session import SessionLocal
from app.crud.crud_user import authenticate_user
from app.crud.crud_audience import (
    create_contact,
    get_contacts,
    create_segment,
    import_contacts_from_csv,
)
from app.schemas.audience import AudienceContactCreate, AudienceSegmentCreate


@pytest.fixture
def db():
    session = SessionLocal()
    yield session
    session.close()


def test_contact_management_and_segmentation(db):
    manager = authenticate_user(db, "manager@commplatform.gov.in", "Manager@12345")

    # 1. Add contact
    c_in = AudienceContactCreate(
        first_name="Venkatesh",
        last_name="Prasad",
        phone_number="+919988776655",
        email="venkatesh.p@example.in",
        preferred_language="Kannada",
        location_state="Karnataka",
        location_district="Mysuru",
        gender="Male",
        age_group="41-60",
        occupation="Agriculturist",
    )
    contact = create_contact(db, c_in, manager.org_id)
    assert contact.first_name == "Venkatesh"
    assert contact.preferred_language == "Kannada"

    # 2. Filter contacts by language
    kannada_contacts, total = get_contacts(db, manager.org_id, language="Kannada")
    assert total >= 1
    assert any(c.phone_number == "+919988776655" for c in kannada_contacts)

    # 3. Create segment
    seg_in = AudienceSegmentCreate(
        name="Karnataka Farmers Group",
        description="Kannada-speaking agriculturists in Karnataka",
        filter_criteria={
            "languages": ["Kannada"],
            "states": ["Karnataka"],
        },
    )
    seg = create_segment(db, seg_in, manager.org_id, manager.id)
    assert seg.name == "Karnataka Farmers Group"
    assert seg.estimated_reach >= 1


def test_csv_import(db):
    manager = authenticate_user(db, "manager@commplatform.gov.in", "Manager@12345")
    csv_sample = """first_name,last_name,phone_number,email,preferred_language,location_state,gender,age_group
Ramesh,Gupta,+919123456780,ramesh.g@example.in,Hindi,Madhya Pradesh,Male,41-60
Meena,Kumari,+919123456781,meena.k@example.in,Hindi,Bihar,Female,26-40
"""
    summary = import_contacts_from_csv(db, manager.org_id, csv_sample)
    assert summary.imported_count == 2
    assert summary.skipped_count == 0
