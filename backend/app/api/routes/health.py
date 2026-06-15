"""Liveness / readiness endpoints for load balancers and uptime checks."""

from __future__ import annotations

from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter(tags=["meta"])


@router.get("/health", summary="Liveness probe")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/ready", summary="Readiness probe")
async def ready() -> dict[str, object]:
    """Reports whether required configuration is present."""
    settings = get_settings()
    checks = {
        "openai_configured": bool(settings.openai_api_key),
        "llama_configured": bool(settings.llama_cloud_api_key),
    }
    return {"status": "ok" if all(checks.values()) else "degraded", "checks": checks}
