"""LlamaParse (LlamaCloud) client factory.

Centralises construction so the API key/timeout config lives in one place
and the client can be swapped or mocked in tests.
"""

from __future__ import annotations

from functools import lru_cache

from llama_cloud import AsyncLlamaCloud

from app.core.config import get_settings


@lru_cache
def get_llama_client() -> AsyncLlamaCloud:
    settings = get_settings()
    return AsyncLlamaCloud(
        api_key=settings.llama_cloud_api_key,
        timeout=settings.request_timeout,
    )
