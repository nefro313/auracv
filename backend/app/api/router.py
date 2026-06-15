"""Aggregates all route modules into a single API router."""

from __future__ import annotations

from fastapi import APIRouter

from app.api.routes import health, resume

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(resume.router)
