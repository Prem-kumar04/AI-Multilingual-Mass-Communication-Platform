from fastapi import APIRouter

from app.api.v1 import (
    auth,
    users,
    roles,
    audiences,
    templates,
    campaigns,
    analytics,
    audit,
    public,
    content_generation,
)

api_router = APIRouter()

api_router.include_router(public.router, prefix="/public", tags=["Public Citizen Information Website"])
api_router.include_router(content_generation.router, prefix="/content-generation", tags=["AI Content Generation"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["User Management"])
api_router.include_router(roles.router, prefix="/roles", tags=["Role & Permission Management"])
api_router.include_router(audiences.router, prefix="/audiences", tags=["Audience & Segmentation"])
api_router.include_router(templates.router, prefix="/templates", tags=["Message Templates"])
api_router.include_router(campaigns.router, prefix="/campaigns", tags=["Campaign Lifecycle & Approvals"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Dashboard Analytics"])
api_router.include_router(audit.router, prefix="/audit", tags=["Security Audit Logs"])

