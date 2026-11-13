import csv
import io
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status

from app.models.audience import AudienceContact, AudienceSegment
from app.schemas.audience import (
    AudienceContactCreate,
    AudienceContactUpdate,
    AudienceSegmentCreate,
    CSVImportSummary,
)


def get_contacts(
    db: Session,
    org_id: str,
    skip: int = 0,
    limit: int = 100,
    language: Optional[str] = None,
    state: Optional[str] = None,
    age_group: Optional[str] = None,
    is_subscribed: Optional[bool] = None,
    search: Optional[str] = None,
) -> Tuple[List[AudienceContact], int]:
    query = db.query(AudienceContact).filter(AudienceContact.org_id == org_id)

    if is_subscribed is not None:
        query = query.filter(AudienceContact.is_subscribed == is_subscribed)
    if language:
        query = query.filter(AudienceContact.preferred_language.ilike(f"%{language.strip()}%"))
    if state:
        query = query.filter(AudienceContact.location_state.ilike(f"%{state.strip()}%"))
    if age_group:
        query = query.filter(AudienceContact.age_group == age_group)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                AudienceContact.first_name.ilike(s),
                AudienceContact.last_name.ilike(s),
                AudienceContact.phone_number.ilike(s),
                AudienceContact.email.ilike(s),
            )
        )

    total = query.count()
    contacts = query.order_by(AudienceContact.created_at.desc()).offset(skip).limit(limit).all()
    return contacts, total


def create_contact(db: Session, contact_in: AudienceContactCreate, org_id: str) -> AudienceContact:
    contact = AudienceContact(
        org_id=org_id,
        first_name=contact_in.first_name,
        last_name=contact_in.last_name,
        phone_number=contact_in.phone_number.strip(),
        email=contact_in.email.strip().lower() if contact_in.email else None,
        preferred_language=contact_in.preferred_language or "English",
        location_state=contact_in.location_state,
        location_district=contact_in.location_district,
        gender=contact_in.gender,
        age_group=contact_in.age_group,
        occupation=contact_in.occupation,
        is_subscribed=contact_in.is_subscribed,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


def update_contact(db: Session, contact_id: str, org_id: str, contact_in: AudienceContactUpdate) -> AudienceContact:
    contact = db.query(AudienceContact).filter(
        AudienceContact.id == contact_id,
        AudienceContact.org_id == org_id,
    ).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")

    for field, value in contact_in.model_dump(exclude_unset=True).items():
        if value is not None:
            if field == "email" and value:
                value = value.strip().lower()
            setattr(contact, field, value)

    db.commit()
    db.refresh(contact)
    return contact


def delete_contact(db: Session, contact_id: str, org_id: str) -> bool:
    contact = db.query(AudienceContact).filter(
        AudienceContact.id == contact_id,
        AudienceContact.org_id == org_id,
    ).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    db.delete(contact)
    db.commit()
    return True


def import_contacts_from_csv(db: Session, org_id: str, csv_content: str) -> CSVImportSummary:
    reader = csv.DictReader(io.StringIO(csv_content))
    total_rows = 0
    imported_count = 0
    skipped_count = 0
    errors = []

    for row_idx, row in enumerate(reader, start=1):
        total_rows += 1
        first_name = row.get("first_name", "").strip()
        phone_number = row.get("phone_number", "").strip()

        if not first_name or not phone_number:
            skipped_count += 1
            errors.append(f"Row {row_idx}: Missing required first_name or phone_number")
            continue

        email = row.get("email", "").strip().lower() or None
        preferred_language = row.get("preferred_language", "English").strip() or "English"
        location_state = row.get("location_state", "").strip() or None
        location_district = row.get("location_district", "").strip() or None
        gender = row.get("gender", "").strip() or None
        age_group = row.get("age_group", "").strip() or None
        occupation = row.get("occupation", "").strip() or None

        contact = AudienceContact(
            org_id=org_id,
            first_name=first_name,
            last_name=row.get("last_name", "").strip() or None,
            phone_number=phone_number,
            email=email,
            preferred_language=preferred_language,
            location_state=location_state,
            location_district=location_district,
            gender=gender,
            age_group=age_group,
            occupation=occupation,
            is_subscribed=True,
        )
        db.add(contact)
        imported_count += 1

    db.commit()
    return CSVImportSummary(
        total_rows=total_rows,
        imported_count=imported_count,
        skipped_count=skipped_count,
        errors=errors[:10],
    )


def evaluate_segment_criteria(db: Session, org_id: str, criteria: Dict[str, Any]) -> int:
    query = db.query(AudienceContact).filter(AudienceContact.org_id == org_id, AudienceContact.is_subscribed == True)
    
    if criteria.get("languages"):
        query = query.filter(AudienceContact.preferred_language.in_(criteria["languages"]))
    if criteria.get("states"):
        query = query.filter(AudienceContact.location_state.in_(criteria["states"]))
    if criteria.get("age_groups"):
        query = query.filter(AudienceContact.age_group.in_(criteria["age_groups"]))
    if criteria.get("genders"):
        query = query.filter(AudienceContact.gender.in_(criteria["genders"]))
    if criteria.get("occupations"):
        query = query.filter(AudienceContact.occupation.in_(criteria["occupations"]))

    return query.count()


def create_segment(db: Session, segment_in: AudienceSegmentCreate, org_id: str, user_id: str) -> AudienceSegment:
    reach = evaluate_segment_criteria(db, org_id, segment_in.filter_criteria)
    segment = AudienceSegment(
        org_id=org_id,
        name=segment_in.name,
        description=segment_in.description,
        filter_criteria=segment_in.filter_criteria,
        estimated_reach=reach,
        created_by=user_id,
    )
    db.add(segment)
    db.commit()
    db.refresh(segment)
    return segment


def get_segments(db: Session, org_id: str) -> List[AudienceSegment]:
    return (
        db.query(AudienceSegment)
        .filter(AudienceSegment.org_id == org_id)
        .order_by(AudienceSegment.created_at.desc())
        .all()
    )

