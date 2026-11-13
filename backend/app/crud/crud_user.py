from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.core.security import get_password_hash, verify_password
from app.models.user import User, Role
from app.schemas.user import UserCreate, UserUpdate


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return (
        db.query(User)
        .options(joinedload(User.roles).joinedload(Role.permissions))
        .filter(User.email == email.lower().strip())
        .first()
    )


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    return (
        db.query(User)
        .options(joinedload(User.roles).joinedload(Role.permissions))
        .filter(User.id == user_id)
        .first()
    )


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def get_users(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    role_filter: Optional[str] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
) -> List[User]:
    query = db.query(User).options(joinedload(User.roles))
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter((User.full_name.ilike(s)) | (User.email.ilike(s)))
    if role_filter:
        query = query.join(User.roles).filter(Role.name == role_filter.upper())
    return query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()


def create_user(db: Session, user_in: UserCreate, default_org_id: str) -> User:
    existing = get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{user_in.email}' already exists.",
        )

    org_id = user_in.org_id or default_org_id
    hashed_pwd = get_password_hash(user_in.password)

    db_user = User(
        org_id=org_id,
        email=user_in.email.lower().strip(),
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        phone_number=user_in.phone_number,
        is_active=user_in.is_active,
    )

    # Attach roles
    for r_name in user_in.role_names:
        role = db.query(Role).filter(Role.name == r_name.upper()).first()
        if role:
            db_user.roles.append(role)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: str, user_in: UserUpdate) -> User:
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user_in.email is not None:
        # Check collision
        coll = get_user_by_email(db, user_in.email)
        if coll and coll.id != user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use")
        db_user.email = user_in.email.lower().strip()

    if user_in.full_name is not None:
        db_user.full_name = user_in.full_name
    if user_in.phone_number is not None:
        db_user.phone_number = user_in.phone_number
    if user_in.is_active is not None:
        db_user.is_active = user_in.is_active
    if user_in.password:
        db_user.hashed_password = get_password_hash(user_in.password)

    if user_in.role_names is not None:
        db_user.roles.clear()
        for r_name in user_in.role_names:
            role = db.query(Role).filter(Role.name == r_name.upper()).first()
            if role:
                db_user.roles.append(role)

    db.commit()
    db.refresh(db_user)
    return db_user

