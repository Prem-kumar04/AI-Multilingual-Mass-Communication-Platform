from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.schemas.campaign import MessageTemplateResponse, MessageTemplateCreate
from app.crud.crud_template import get_templates, create_template, delete_template
from app.core.permissions import require_manager_or_admin, require_any_authenticated

router = APIRouter()


@router.get("", response_model=List[MessageTemplateResponse])
def list_message_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
):
    """Retrieve all reusable organizational message templates."""
    return get_templates(db=db, org_id=current_user.org_id)


@router.post("", response_model=MessageTemplateResponse, status_code=status.HTTP_201_CREATED)
def create_new_template(
    template_in: MessageTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Create a new reusable message template."""
    return create_template(
        db=db,
        template_in=template_in,
        org_id=current_user.org_id,
        user_id=current_user.id,
    )


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Delete a message template."""
    delete_template(db=db, template_id=template_id, org_id=current_user.org_id)
    return None

