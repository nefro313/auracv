"""Request bodies — keys match what the Next.js `create` page sends."""

from __future__ import annotations

from pydantic import BaseModel, Field


class ExtractPdfRequest(BaseModel):
    pdfUrl: str = Field(..., min_length=1, description="Public URL of the resume PDF")
