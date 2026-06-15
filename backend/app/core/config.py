"""Application settings, loaded from environment / .env file."""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- App ---
    app_name: str = Field(default="AuraCV Resume Backend", alias="APP_NAME")
    environment: Literal["development", "staging", "production"] = Field(
        default="development", alias="ENVIRONMENT"
    )
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    # --- OpenAI ---
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    # Best accuracy/cost balance for structured resume extraction. Override
    # with e.g. gpt-4.1-mini for cheaper/faster runs via OPENAI_MODEL.
    openai_model: str = Field(default="gpt-4.1", alias="OPENAI_MODEL")
    max_tokens: int = Field(default=8000, alias="OPENAI_MAX_TOKENS")
    openai_timeout: float = Field(default=60.0, alias="OPENAI_TIMEOUT")

    # --- LlamaParse (PDF text extraction) ---
    llama_cloud_api_key: str = Field(default="", alias="LLAMA_CLOUD_API_KEY")
    # Parsing tier — cost_effective is the sweet spot for text-based resumes
    # (clean markdown, simple tables). Bump to agentic for complex layouts.
    llama_tier: Literal["fast", "cost_effective", "agentic", "agentic_plus"] = Field(
        default="cost_effective", alias="LLAMA_TIER"
    )
    # Parser version pin; "latest" tracks the newest release.
    llama_parse_version: str = Field(default="latest", alias="LLAMA_PARSE_VERSION")
    # Upper bound (seconds) on a single parse, including job polling. Keeps a
    # slow parse from blocking the request indefinitely (SDK default is 7200s).
    llama_timeout: float = Field(default=120.0, alias="LLAMA_TIMEOUT")

    # --- HTTP fetching ---
    request_timeout: float = Field(default=30.0, alias="REQUEST_TIMEOUT")
    # Max PDF size to download, in bytes (default 10 MB).
    max_pdf_bytes: int = Field(default=10 * 1024 * 1024, alias="MAX_PDF_BYTES")

    # --- CORS ---
    # Comma-separated list of allowed origins for the browser frontend.
    cors_origins: str = Field(default="http://localhost:3000", alias="CORS_ORIGINS")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton (import-safe, test-overridable)."""
    return Settings()
