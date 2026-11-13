from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.campaign import MessageTemplate
from app.schemas.campaign import MessageTemplateCreate


def get_templates(db: Session, org_id: str) -> List[MessageTemplate]:
    return (
        db.query(MessageTemplate)
        .filter(MessageTemplate.org_id == org_id)
        .order_by(MessageTemplate.created_at.desc())
        .all()
    )


def create_template(db: Session, template_in: MessageTemplateCreate, org_id: str, user_id: str) -> MessageTemplate:
    tmpl = MessageTemplate(
        org_id=org_id,
        title=template_in.title,
        category=template_in.category,
        content=template_in.content,
        variables=template_in.variables,
        created_by=user_id,
    )
    db.add(tmpl)
    db.commit()
    db.refresh(tmpl)
    return tmpl


def delete_template(db: Session, template_id: str, org_id: str) -> bool:
    tmpl = db.query(MessageTemplate).filter(
        MessageTemplate.id == template_id,
        MessageTemplate.org_id == org_id,
    ).first()
    if not tmpl:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    db.delete(tmpl)
    db.commit()
    return True

