"""Turn raw resume/profile text into a validated `UserProfile`.

Uses OpenAI Structured Outputs: we hand the OpenAI SDK our Pydantic
`UserProfile` as `response_format`, so the model is constrained to return
JSON in exactly that shape, and the SDK parses it straight back into a
`UserProfile` instance.
"""

from __future__ import annotations

import logging

from openai import APIError

from app.clients.openai_client import get_openai_client
from app.core.config import get_settings
from app.core.exceptions import ExtractionError
from app.schemas import UserProfile

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = (
    "You are a meticulous resume parser. You convert raw resume or "
    "professional-profile text into a single structured object that "
    "describes the person's portfolio. Rules:\n"
    "- Only use information present in the supplied text. Never invent "
    "employers, dates, schools, or achievements.\n"
    "- If a field is unknown, leave it as an empty string or empty list — "
    "do not guess or use placeholders.\n"
    "- Preserve dates roughly as written (ISO YYYY-MM-DD when a full date "
    "is available; otherwise keep the original form such as 'Present').\n"
    "- Split skills into sensible named groups under `skills` (e.g. "
    "Frontend, Backend, Tools), each with a `keywords` list.\n"
    "- Put bullet-point accomplishments into the relevant `highlights` "
    "arrays.\n"
    "- Leave avatar/image, email override, userName and theme fields blank; "
    "the application fills those in later."
)


async def extract_profile(raw_text: str, *, source: str) -> UserProfile:
    """Extract a `UserProfile` from raw text.

    `source` is a short label ('resume PDF' / 'LinkedIn profile') used only
    to give the model a little context.
    """
    settings = get_settings()
    if not settings.openai_api_key:
        raise ExtractionError("OPENAI_API_KEY is not configured")

    client = get_openai_client()

    user_message = (
        f"Extract a portfolio from the following {source} text.\n\n"
        f"<text>\n{raw_text}\n</text>"
    )

    try:
        completion = await client.chat.completions.parse(
            model=settings.openai_model,
            max_completion_tokens=settings.max_tokens,
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            response_format=UserProfile,
        )
    except APIError as exc:
        raise ExtractionError(f"OpenAI request failed: {exc}") from exc

    message = completion.choices[0].message

    if message.refusal:
        raise ExtractionError(f"Model refused the request: {message.refusal}")

    profile = message.parsed
    if profile is None:
        raise ExtractionError("Model did not return a structured portfolio")

    logger.info("Extracted portfolio from %s (%d chars)", source, len(raw_text))
    return profile
