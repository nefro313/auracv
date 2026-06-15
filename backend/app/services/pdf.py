"""Download a resume PDF and extract its text via LlamaParse.

We download the PDF ourselves (so the size guard and clear error messages
stay in this service) and hand the bytes to LlamaParse, which returns clean
markdown well suited to the downstream LLM extraction step.
"""

from __future__ import annotations

import logging

import httpx
from llama_cloud import BadRequestError, LlamaCloudError, UnprocessableEntityError

from app.clients.llama_client import get_llama_client
from app.core.config import get_settings
from app.core.exceptions import PdfError, PdfParseError

logger = logging.getLogger(__name__)


async def fetch_pdf_bytes(url: str) -> bytes:
    settings = get_settings()
    try:
        async with httpx.AsyncClient(
            timeout=settings.request_timeout, follow_redirects=True
        ) as client:
            resp = await client.get(url)
            resp.raise_for_status()
    except httpx.HTTPError as exc:
        raise PdfError(f"Could not download PDF: {exc}") from exc

    data = resp.content
    if len(data) > settings.max_pdf_bytes:
        raise PdfError("PDF exceeds the maximum allowed size")
    if not data:
        raise PdfError("Downloaded PDF was empty")
    return data


async def parse_pdf(data: bytes, *, filename: str = "resume.pdf") -> str:
    """Extract document text from PDF bytes using LlamaParse.

    Prefers markdown (structure helps the downstream LLM) and falls back to
    plain text for tiers that don't emit markdown (e.g. ``fast``).
    """
    settings = get_settings()
    if not settings.llama_cloud_api_key:
        raise PdfError("LLAMA_CLOUD_API_KEY is not configured")

    client = get_llama_client()
    try:
        result = await client.parsing.parse(
            upload_file=(filename, data, "application/pdf"),
            tier=settings.llama_tier,
            version=settings.llama_parse_version,
            expand=["markdown_full", "text_full"],
            timeout=settings.llama_timeout,
        )
    except (BadRequestError, UnprocessableEntityError) as exc:
        # The file we sent was rejected — treat as a client/input problem.
        raise PdfError(f"The PDF could not be parsed: {exc}") from exc
    except LlamaCloudError as exc:
        # Auth, rate-limit, timeout, connection or upstream 5xx — not the
        # caller's fault, so surface it as an upstream (502) failure.
        logger.error("LlamaParse request failed: %s", exc)
        raise PdfParseError("PDF parsing service is unavailable") from exc

    text = (result.markdown_full or result.text_full or "").strip()
    if not text:
        raise PdfError("No extractable text found — the PDF may be a scanned image")
    logger.info(
        "Parsed PDF via LlamaParse (%d chars, tier=%s)", len(text), settings.llama_tier
    )
    return text


async def pdf_url_to_text(url: str) -> str:
    data = await fetch_pdf_bytes(url)
    return await parse_pdf(data)
