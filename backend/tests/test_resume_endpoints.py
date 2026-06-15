"""Endpoint tests with the external IO (PDF fetch, scrape, OpenAI) mocked."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.core.exceptions import PdfError
from app.schemas import UserProfile


def test_extract_pdf_validates_body(client: TestClient) -> None:
    resp = client.post("/extract-pdf", json={})
    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == "validation_error"


def test_extract_pdf_maps_pdf_error(client: TestClient, monkeypatch) -> None:
    async def boom(_url: str) -> str:
        raise PdfError("bad pdf")

    monkeypatch.setattr("app.api.routes.resume.pdf_url_to_text", boom)

    resp = client.post("/extract-pdf", json={"pdfUrl": "http://x/y.pdf"})
    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == "pdf_error"


def test_extract_pdf_happy_path(client: TestClient, monkeypatch) -> None:
    async def fake_text(_url: str) -> str:
        return "resume text"

    async def fake_extract(_text: str, *, source: str) -> UserProfile:
        return UserProfile.model_validate({"basics": {"name": "Jane Dev"}})

    monkeypatch.setattr("app.api.routes.resume.pdf_url_to_text", fake_text)
    monkeypatch.setattr("app.api.routes.resume.extract_profile", fake_extract)

    resp = client.post("/extract-pdf", json={"pdfUrl": "http://x/y.pdf"})
    assert resp.status_code == 200
    assert resp.json()["basics"]["name"] == "Jane Dev"
