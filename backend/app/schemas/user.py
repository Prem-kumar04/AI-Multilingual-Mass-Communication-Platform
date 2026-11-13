from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict


class PermissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    code: str
    resource: str
    action: str
    description: Optional[str] = None


class RoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    description: Optional[str] = None
    is_system_role: bool
    permissions: List[PermissionResponse] = []


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone_number: Optional[str] = None
    is_active: bool = True


class UserCreate(UserBase):
    password: str
    role_names: List[str]  # e.g. ["MANAGER"]
    org_id: Optional[str] = None


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    is_active: Optional[bool] = None
    role_names: Optional[List[str]] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    org_id: str
    created_at: datetime
    updated_at: datetime
    roles: List[RoleResponse] = []

