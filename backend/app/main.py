"""Application factory for the AuraCV resume backend.

Serves the resume-extraction endpoint the Next.js frontend calls via
`NEXT_PUBLIC_BACKEND`:
  POST /extract-pdf   { "pdfUrl": "..." }      -> UserProfile JSON
"""

from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import Settings, get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings: Settings = app.state.settings
    logger.info(
        "Starting %s (env=%s, model=%s)",
        settings.app_name,
        settings.environment,
        settings.openai_model,
    )
    if not settings.openai_api_key:
        logger.warning("OPENAI_API_KEY is not set — extraction will fail")
    yield
    logger.info("Shutting down %s", settings.app_name)


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(level=settings.log_level, json_logs=settings.is_production)

    app = FastAPI(
        title=settings.app_name,
        version="1.0.0",
        summary="Parses resumes/profiles into the portfolio JSON schema.",
        docs_url=None if settings.is_production else "/docs",
        redoc_url=None if settings.is_production else "/redoc",
        lifespan=lifespan,
    )
    app.state.settings = settings

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)
    app.include_router(api_router)
    return app


app = create_app()
