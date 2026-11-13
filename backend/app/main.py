import sys
from pathlib import Path

# Automatically ensure backend folder is in sys.path
backend_dir = str(Path(__file__).resolve().parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.core.config import settings
from app.api.api_router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-stack AI-Powered Multilingual Mass Communication Platform API with strict RBAC and multi-channel dispatch architecture.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
def root():
    """Root endpoint for platform status and quick links."""
    return {
        "status": "online",
        "platform": settings.PROJECT_NAME,
        "version": "1.0.0",
        "message": "AI-Powered Multilingual Mass Communication Platform Backend is running successfully.",
        "documentation": "http://127.0.0.1:8000/docs",
        "frontend_ui": "http://localhost:5173",
        "api_v1_base": settings.API_V1_STR,
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Platform health check endpoint."""
    return {
        "status": "healthy",
        "platform": settings.PROJECT_NAME,
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get(f"{settings.API_V1_STR}/docs", include_in_schema=False)
def api_v1_docs():
    return RedirectResponse(url="/docs")

