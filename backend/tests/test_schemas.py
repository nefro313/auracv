from __future__ import annotations

from typing import Any, cast

from openai.lib._parsing._completions import type_to_response_format_param

from app.schemas import UserProfile

# Top-level keys the frontend's UserProfile type (src/lib/type.ts) expects.
EXPECTED_KEYS = {
    "meta",
    "basics",
    "certificates",
    "education",
    "skills",
    "awards",
    "hackathons",
    "publications",
    "volunteer",
    "work",
    "projects",
    "languages",
    "interests",
    "references",
}


def test_userprofile_matches_frontend_shape() -> None:
    keys = set(UserProfile().model_dump().keys())
    assert keys == EXPECTED_KEYS


def test_userprofile_ignores_unknown_keys() -> None:
    profile = UserProfile.model_validate({"unknown": 1, "basics": {"name": "Jo"}})
    assert profile.basics.name == "Jo"
    assert "unknown" not in profile.model_dump()


def test_schema_is_valid_for_openai_structured_outputs() -> None:
    rf = cast(dict[str, Any], type_to_response_format_param(UserProfile))
    schema = rf["json_schema"]
    assert schema["strict"] is True
    assert schema["schema"]["additionalProperties"] is False
    assert set(schema["schema"]["properties"].keys()) == EXPECTED_KEYS
