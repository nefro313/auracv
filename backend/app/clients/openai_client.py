"""OpenAI client factory.

Centralises construction so the API key/timeout config lives in one place
and the client can be swapped or mocked in tests.
"""

from __future__ import annotations

from functools import lru_cache

from openai import AsyncOpenAI

from app.core.config import get_settings


@lru_cache
def get_openai_client() -> AsyncOpenAI:
    settings = get_settings()
    return AsyncOpenAI(
        api_key=settings.openai_api_key,
        timeout=settings.openai_timeout,
    )
