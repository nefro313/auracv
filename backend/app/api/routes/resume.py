"""Resume-processing endpoints consumed by the Next.js `create` page.

The public path is intentionally unversioned (`/extract-pdf`) to match the
contract the frontend calls via `NEXT_PUBLIC_BACKEND`.

LinkedIn URL import used to live here (`/get-resume`) but was removed:
LinkedIn blocks anonymous scraping behind a login wall and the providers that
worked around it (e.g. Proxycurl) were shut down after LinkedIn litigation.
The create page now asks users to export their LinkedIn profile as a PDF and
upload it through `/extract-pdf` instead.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.schemas import ExtractPdfRequest, UserProfile
from app.services.extraction import extract_profile
from app.services.pdf import pdf_url_to_text

router = APIRouter(tags=["resume"])


@router.post("/extract-pdf", response_model=UserProfile, summary="Parse a resume PDF")
async def extract_pdf(body: ExtractPdfRequest) -> UserProfile:
    """Download a resume PDF and return a structured portfolio."""
    text = await pdf_url_to_text(body.pdfUrl)
    return await extract_profile(text, source="resume PDF")
