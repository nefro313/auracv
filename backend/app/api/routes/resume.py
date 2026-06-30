"""Resume-processing endpoints consumed by the Next.js `create` page.

The public path is intentionally unversioned (`/extract-pdf`) to match the
contract the frontend calls via `NEXT_PUBLIC_BACKEND`.

The handler delegates to `ProfileWorkflow` (an in-process LlamaIndex Agent
Workflow) which orchestrates the parse -> extract pipeline; domain errors
raised inside its steps propagate unwrapped to the exception handlers.

LinkedIn URL import used to live here (`/get-resume`) but was removed:
LinkedIn blocks anonymous scraping behind a login wall and the providers that
worked around it (e.g. Proxycurl) were shut down after LinkedIn litigation.
The create page now asks users to export their LinkedIn profile as a PDF and
upload it through `/extract-pdf` instead.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.schemas import ExtractPdfRequest, UserProfile
from app.workflows.profile import run_profile_workflow

router = APIRouter(tags=["resume"])


@router.post("/extract-pdf", response_model=UserProfile, summary="Parse a resume PDF")
async def extract_pdf(body: ExtractPdfRequest) -> UserProfile:
    """Download a resume PDF and return a structured portfolio."""
    return await run_profile_workflow(body.pdfUrl)
