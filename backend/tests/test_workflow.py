"""Tests for the extraction Agent Workflow and its pure step helpers.

`asyncio_mode = "auto"` means async tests need no marker.
"""

from __future__ import annotations

import pytest

from app.core.exceptions import PdfError
from app.schemas import UserProfile
from app.workflows.profile import (
    detect_source,
    normalize_profile,
    run_profile_workflow,
)


async def test_workflow_runs_pipeline(monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_text(_url: str) -> str:
        return "resume text"

    async def fake_extract(_text: str, *, source: str) -> UserProfile:
        return UserProfile.model_validate({"basics": {"name": "Ada"}})

    monkeypatch.setattr("app.workflows.profile.pdf_url_to_text", fake_text)
    monkeypatch.setattr("app.workflows.profile.extract_profile", fake_extract)

    profile = await run_profile_workflow("http://x/y.pdf")
    assert profile.basics.name == "Ada"


async def test_workflow_propagates_domain_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    async def boom(_url: str) -> str:
        raise PdfError("bad pdf")

    monkeypatch.setattr("app.workflows.profile.pdf_url_to_text", boom)

    with pytest.raises(PdfError):
        await run_profile_workflow("http://x/y.pdf")


async def test_workflow_routes_classified_source(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    seen: dict[str, str] = {}

    async def fake_text(_url: str) -> str:
        return "Jane Dev\nPage 1 of 2\nTop Skills\nlinkedin.com/in/janedev"

    async def fake_extract(_text: str, *, source: str) -> UserProfile:
        seen["source"] = source
        return UserProfile.model_validate({"basics": {"name": "Jane"}})

    monkeypatch.setattr("app.workflows.profile.pdf_url_to_text", fake_text)
    monkeypatch.setattr("app.workflows.profile.extract_profile", fake_extract)

    await run_profile_workflow("http://x/y.pdf")
    assert seen["source"] == "LinkedIn profile"


def test_detect_source_defaults_to_resume() -> None:
    assert detect_source("Software engineer at Acme.") == "resume PDF"


def test_detect_source_flags_linkedin_export() -> None:
    text = "Jane Dev\nPage 1 of 2\nTop Skills\nPython\nwww.linkedin.com/in/janedev"
    assert detect_source(text) == "LinkedIn profile"


def test_normalize_profile_dedupes_and_trims_skills() -> None:
    profile = UserProfile.model_validate(
        {
            "basics": {"skills": [" Python ", "python", "", "Go"]},
            "skills": [
                {"name": "Backend", "keywords": ["FastAPI", "fastapi ", "FastAPI"]}
            ],
        }
    )
    cleaned = normalize_profile(profile)
    assert cleaned.basics.skills == ["Python", "Go"]
    assert cleaned.skills[0].keywords == ["FastAPI"]
