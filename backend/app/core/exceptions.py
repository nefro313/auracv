"""Domain exceptions and their HTTP representation.

Services raise these provider-agnostic errors; the API layer never has to
know about FastAPI's HTTPException. `register_exception_handlers` wires
them to a consistent JSON error envelope:

    { "error": { "code": "pdf_error", "message": "..." } }
"""

from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


class AppError(Exception):
    """Base class for expected, mapped application errors."""

    status_code: int = 500
    code: str = "internal_error"

    def __init__(self, message: str | None = None) -> None:
        self.message = message or self.__class__.__doc__ or "Error"
        super().__init__(self.message)


class PdfError(AppError):
    """The resume PDF could not be downloaded or read (bad/empty/corrupt)."""

    status_code = 422
    code = "pdf_error"


class PdfParseError(AppError):
    """The upstream PDF parsing service (LlamaParse) failed or was unavailable."""

    status_code = 502
    code = "pdf_parse_error"


class ExtractionError(AppError):
    """The model failed to return a usable structured result."""

    status_code = 502
    code = "extraction_error"


def _error_body(code: str, message: str) -> dict:
    return {"error": {"code": code, "message": message}}


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _handle_app_error(_: Request, exc: AppError) -> JSONResponse:
        if exc.status_code >= 500:
            logger.error("%s: %s", exc.code, exc.message)
        return JSONResponse(
            status_code=exc.status_code,
            content=_error_body(exc.code, exc.message),
        )

    @app.exception_handler(RequestValidationError)
    async def _handle_validation(
        _: Request, exc: RequestValidationError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content=_error_body("validation_error", "Invalid request body")
            | {"detail": exc.errors()},
        )

    @app.exception_handler(Exception)
    async def _handle_unexpected(_: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled error: %s", exc)
        return JSONResponse(
            status_code=500,
            content=_error_body("internal_error", "Internal server error"),
        )
