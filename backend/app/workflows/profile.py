"""Event-driven orchestration for the resume -> portfolio pipeline.

A LlamaIndex Agent Workflow (the `workflows` engine) used as an in-process
library -- not a reasoning agent and not a cloud deployment. The graph is::

    ingest -> classify -> extract -> normalize

`ingest` and `extract` delegate to the existing services; `classify` and
`normalize` are pure, deterministic, and network-free. Behaviour for a plain
resume matches calling the services directly. Further steps slot in the same
way -- e.g. validating that extracted links resolve, enriching from GitHub,
or a human-in-the-loop review gate before the StopEvent.

The `/extract-pdf` contract and the AppError -> JSON error envelope are
untouched: domain errors raised inside steps propagate to the API layer
unwrapped.
"""

from __future__ import annotations

import logging

from workflows import Workflow, step
from workflows.events import Event, StartEvent, StopEvent

from app.core.config import get_settings
from app.core.exceptions import ExtractionError
from app.schemas import UserProfile
from app.services.extraction import extract_profile
from app.services.pdf import pdf_url_to_text

logger = logging.getLogger(__name__)

# Markers characteristic of a LinkedIn "Save to PDF" export. A plain resume
# may list a LinkedIn URL, so we require two signals before treating the
# document as an export (the label only nudges the extractor; see below).
_LINKEDIN_MARKERS = ("linkedin.com/in/", "top skills", "page 1 of")


# --- Events ---------------------------------------------------------------


class ParseRequest(StartEvent):
    """Workflow input: the public URL of the resume PDF."""

    pdf_url: str


class DocParsed(Event):
    """Raw document text extracted from the uploaded PDF."""

    text: str


class DocClassified(Event):
    """Document text plus a best-effort source label for the extractor."""

    text: str
    source: str


class ProfileDrafted(Event):
    """The model's first-pass portfolio, before normalisation."""

    profile: UserProfile


# --- Pure step helpers (deterministic, network-free) ----------------------


def detect_source(text: str) -> str:
    """Label the document so the extractor gets the right context.

    Returns the source strings `services/extraction.py` understands
    ("LinkedIn profile" / "resume PDF"). It is only a hint to the model --
    it never blocks extraction.
    """
    lowered = text.lower()
    hits = sum(marker in lowered for marker in _LINKEDIN_MARKERS)
    return "LinkedIn profile" if hits >= 2 else "resume PDF"


def _dedupe(items: list[str]) -> list[str]:
    """Trim, drop blanks, and remove case-insensitive duplicates (order kept)."""
    seen: set[str] = set()
    out: list[str] = []
    for raw in items:
        item = raw.strip()
        key = item.lower()
        if item and key not in seen:
            seen.add(key)
            out.append(item)
    return out


def normalize_profile(profile: UserProfile) -> UserProfile:
    """Deterministically clean the skills the LLM most often duplicates.

    Operates on the top-level skill groups and `basics.skills` without
    inventing or dropping real content.
    """
    cleaned = profile.model_copy(deep=True)
    cleaned.basics.skills = _dedupe(cleaned.basics.skills)
    for group in cleaned.skills:
        group.keywords = _dedupe(group.keywords)
    return cleaned


# --- Workflow -------------------------------------------------------------


class ProfileWorkflow(Workflow):
    """Parse -> classify -> extract -> normalise into a UserProfile."""

    @step
    async def ingest(self, ev: ParseRequest) -> DocParsed:
        """Download the PDF and parse it to text via LlamaParse."""
        return DocParsed(text=await pdf_url_to_text(ev.pdf_url))

    @step
    async def classify(self, ev: DocParsed) -> DocClassified:
        """Tag the document type to steer the extraction prompt."""
        source = detect_source(ev.text)
        logger.info("Classified document as %s", source)
        return DocClassified(text=ev.text, source=source)

    @step
    async def extract(self, ev: DocClassified) -> ProfileDrafted:
        """Structure the document text into a UserProfile."""
        profile = await extract_profile(ev.text, source=ev.source)
        return ProfileDrafted(profile=profile)

    @step
    async def normalize(self, ev: ProfileDrafted) -> StopEvent:
        """Deterministically clean the drafted portfolio."""
        return StopEvent(result=normalize_profile(ev.profile))


async def run_profile_workflow(pdf_url: str) -> UserProfile:
    """Run the extraction workflow and return the structured portfolio.

    Domain errors raised inside steps (e.g. PdfError, ExtractionError)
    propagate unwrapped to the API layer's exception handlers.
    """
    settings = get_settings()
    timeout = (
        settings.request_timeout + settings.llama_timeout + settings.openai_timeout
    )
    result = await ProfileWorkflow(timeout=timeout).run(
        start_event=ParseRequest(pdf_url=pdf_url)
    )
    if not isinstance(result, UserProfile):
        raise ExtractionError("Workflow did not produce a portfolio")
    return result
