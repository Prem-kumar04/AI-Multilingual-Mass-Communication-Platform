from typing import List, Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File, status, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.schemas.audience import (
    AudienceContactResponse,
    AudienceContactCreate,
    AudienceContactUpdate,
    AudienceSegmentResponse,
    AudienceSegmentCreate,
    CSVImportSummary,
)
from app.crud.crud_audience import (
    get_contacts,
    create_contact,
    update_contact,
    delete_contact,
    import_contacts_from_csv,
    create_segment,
    get_segments,
)
from app.crud.crud_audit import log_audit_event
from app.core.permissions import require_manager_or_admin, require_any_authenticated

router = APIRouter()


@router.get("/contacts", response_model=List[AudienceContactResponse])
def list_audience_contacts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    language: Optional[str] = None,
    state: Optional[str] = None,
    age_group: Optional[str] = None,
    is_subscribed: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
):
    """Retrieve audience contact directory with demographic filters."""
    contacts, _ = get_contacts(
        db=db,
        org_id=current_user.org_id,
        skip=skip,
        limit=limit,
        language=language,
        state=state,
        age_group=age_group,
        is_subscribed=is_subscribed,
        search=search,
    )
    return contacts


@router.post("/contacts", response_model=AudienceContactResponse, status_code=status.HTTP_201_CREATED)
def create_audience_contact(
    contact_in: AudienceContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Add a new contact to the audience directory."""
    contact = create_contact(db=db, contact_in=contact_in, org_id=current_user.org_id)
    log_audit_event(
        db=db,
        action="AUDIENCE_CONTACT_CREATE",
        resource_type="AUDIENCE",
        user_id=current_user.id,
        org_id=current_user.org_id,
        resource_id=contact.id,
    )
    return contact


@router.put("/contacts/{contact_id}", response_model=AudienceContactResponse)
def update_audience_contact(
    contact_id: str,
    contact_in: AudienceContactUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Update audience contact record."""
    return update_contact(
        db=db,
        contact_id=contact_id,
        org_id=current_user.org_id,
        contact_in=contact_in,
    )


@router.delete("/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_audience_contact(
    contact_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Remove a contact from the audience directory."""
    delete_contact(db=db, contact_id=contact_id, org_id=current_user.org_id)
    return None


@router.post("/contacts/import-csv", response_model=CSVImportSummary)
async def upload_contacts_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Bulk import audience contacts via standard CSV upload."""
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a valid .csv file",
        )
    content = await file.read()
    try:
        csv_text = content.decode("utf-8")
    except UnicodeDecodeError:
        csv_text = content.decode("latin-1")

    summary = import_contacts_from_csv(
        db=db,
        org_id=current_user.org_id,
        csv_content=csv_text,
    )
    log_audit_event(
        db=db,
        action="AUDIENCE_CSV_IMPORT",
        resource_type="AUDIENCE",
        user_id=current_user.id,
        org_id=current_user.org_id,
        payload_after={"imported": summary.imported_count, "total": summary.total_rows},
    )
    return summary


@router.get("/segments", response_model=List[AudienceSegmentResponse])
def list_audience_segments(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
):
    """Retrieve saved audience segments with estimated reach."""
    return get_segments(db=db, org_id=current_user.org_id)


@router.post("/segments", response_model=AudienceSegmentResponse, status_code=status.HTTP_201_CREATED)
def create_audience_segment(
    segment_in: AudienceSegmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Define a dynamic audience segment and precalculate current audience reach."""
    segment = create_segment(
        db=db,
        segment_in=segment_in,
        org_id=current_user.org_id,
        user_id=current_user.id,
    )
    log_audit_event(
        db=db,
        action="AUDIENCE_SEGMENT_CREATE",
        resource_type="AUDIENCE",
        user_id=current_user.id,
        org_id=current_user.org_id,
        resource_id=segment.id,
        payload_after={"name": segment.name, "reach": segment.estimated_reach},
    )
    return segment

