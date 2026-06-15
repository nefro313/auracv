from __future__ import annotations

from types import SimpleNamespace
from typing import Any

import httpx
import pytest
from llama_cloud import BadRequestError, LlamaCloudError

from app.core.config import get_settings
from app.core.exceptions import PdfError, PdfParseError
from app.services.pdf import parse_pdf


def _fake_client(
    *, markdown_full: str | None = None, text_full: str | None = None
) -> SimpleNamespace:
    async def fake_parse(**_kwargs: Any) -> SimpleNamespace:
        return SimpleNamespace(markdown_full=markdown_full, text_full=text_full)

    return SimpleNamespace(parsing=SimpleNamespace(parse=fake_parse))


async def test_parse_pdf_prefers_markdown(monkeypatch: pytest.MonkeyPatch) -> None:
    client = _fake_client(markdown_full="# Jane Dev", text_full="Jane Dev")
    monkeypatch.setattr("app.services.pdf.get_llama_client", lambda: client)

    assert await parse_pdf(b"%PDF-fake") == "# Jane Dev"


async def test_parse_pdf_falls_back_to_text(monkeypatch: pytest.MonkeyPatch) -> None:
    client = _fake_client(markdown_full=None, text_full="Jane Dev")
    monkeypatch.setattr("app.services.pdf.get_llama_client", lambda: client)

    assert await parse_pdf(b"%PDF-fake") == "Jane Dev"


async def test_parse_pdf_rejects_empty_result(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    client = _fake_client(markdown_full="   ", text_full=None)
    monkeypatch.setattr("app.services.pdf.get_llama_client", lambda: client)

    with pytest.raises(PdfError):
        await parse_pdf(b"%PDF-fake")


async def test_parse_pdf_maps_service_error_to_502(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    async def boom(**_kwargs: Any) -> None:
        raise LlamaCloudError("upstream down")

    client = SimpleNamespace(parsing=SimpleNamespace(parse=boom))
    monkeypatch.setattr("app.services.pdf.get_llama_client", lambda: client)

    with pytest.raises(PdfParseError):
        await parse_pdf(b"%PDF-fake")


async def test_parse_pdf_maps_bad_file_to_pdf_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    async def boom(**_kwargs: Any) -> None:
        response = httpx.Response(400, request=httpx.Request("POST", "http://test"))
        raise BadRequestError("invalid file", response=response, body=None)

    client = SimpleNamespace(parsing=SimpleNamespace(parse=boom))
    monkeypatch.setattr("app.services.pdf.get_llama_client", lambda: client)

    with pytest.raises(PdfError):
        await parse_pdf(b"%PDF-fake")


async def test_parse_pdf_requires_api_key(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("LLAMA_CLOUD_API_KEY", raising=False)
    get_settings.cache_clear()

    with pytest.raises(PdfError):
        await parse_pdf(b"%PDF-fake")
