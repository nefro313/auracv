# AuraCV Resume Backend

FastAPI service that powers AuraCV's AI portfolio generation. It takes a
resume PDF (or a profile URL) and returns structured portfolio JSON in the
exact shape the Next.js frontend consumes (`UserProfile` in
`src/lib/type.ts`).

This is the service the frontend reaches via `NEXT_PUBLIC_BACKEND`.

## Stack

- **FastAPI** — web framework
- **Pydantic v2** — schema validation & serialization
- **OpenAI** — resume → structured JSON (Structured Outputs)
- **LlamaParse** (LlamaCloud) — PDF → clean markdown/text extraction
- **httpx** — async HTTP fetching
- **uv** — package & environment manager

## Endpoints

| Method | Path           | Body                       | Returns        |
| ------ | -------------- | -------------------------- | -------------- |
| POST   | `/extract-pdf` | `{ "pdfUrl": "..." }`      | `UserProfile`  |
| GET    | `/health`      | —                          | liveness probe |
| GET    | `/ready`       | —                          | readiness probe |

The resume path is intentionally **unversioned** to match the contract the
frontend calls via `NEXT_PUBLIC_BACKEND`. Interactive docs at `/docs` (disabled
when `ENVIRONMENT=production`).

## Project layout

```
app/
├── main.py              # create_app() factory: lifespan, middleware, handlers
├── core/                # cross-cutting concerns
│   ├── config.py        #   Settings (pydantic-settings)
│   ├── logging.py       #   plain (dev) / JSON (prod) logging
│   └── exceptions.py    #   domain errors + consistent JSON error envelope
├── api/                 # transport layer
│   ├── router.py        #   aggregates route modules
│   └── routes/          #   resume.py, health.py
├── schemas/             # Pydantic models
│   ├── profile.py       #   UserProfile (mirrors src/lib/type.ts)
│   └── requests.py      #   request bodies
├── services/            # business logic (provider-agnostic)
│   ├── pdf.py           #   download PDF + extract text via LlamaParse
│   └── extraction.py    #   text -> UserProfile via OpenAI
└── clients/             # external client factories
    ├── openai_client.py
    └── llama_client.py
tests/                   # pytest suite (IO mocked)
```

The layering is one-directional: `api → services → clients`, with `core`,
`schemas` shared. Services raise domain exceptions (`PdfError`,
`ExtractionError`); the API layer never constructs `HTTPException` itself.

## Setup

```bash
cd backend
cp .env.template .env        # then add OPENAI_API_KEY + LLAMA_CLOUD_API_KEY
uv sync                      # install dependencies into .venv
```

## Run

```bash
make dev                           # autoreload on http://localhost:8000
# or directly:
uv run fastapi dev app/main.py
# production:
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Point the frontend at it by setting in the frontend's `.env.local`:

```
NEXT_PUBLIC_BACKEND=http://localhost:8000
```

## Development

```bash
make check     # lint + typecheck + tests
make test      # pytest
make lint      # ruff check
make format    # ruff format + autofix
make typecheck # mypy
```

## Docker

```bash
docker build -t auracv-resume-backend .
docker run -p 8000:8000 --env-file .env auracv-resume-backend
```

Multi-stage build on the `uv` base image, runs as a non-root user with a
built-in `/health` healthcheck.

## Notes

- **LinkedIn import** was removed. LinkedIn blocks anonymous scraping behind a
  login wall and the providers that worked around it (e.g. Proxycurl) were shut
  down following LinkedIn litigation. Instead, users export their LinkedIn
  profile as a PDF (**More → Save to PDF**) and upload it through
  `/extract-pdf` — the same pipeline as any other resume.
- **PDF parsing**: `/extract-pdf` downloads the PDF (size-guarded) and sends
  the bytes to **LlamaParse**, which returns clean markdown for the LLM step.
  The tier defaults to `cost_effective` (good for text resumes); set
  `LLAMA_TIER=agentic` for complex/scanned layouts. Requires
  `LLAMA_CLOUD_API_KEY`.
- **Model**: defaults to `gpt-4.1`. Set `OPENAI_MODEL=gpt-4.1-mini` for
  cheaper/faster extraction.
- The model is instructed never to invent information; unknown fields come
  back empty. The frontend fills in avatar, email, username and theme from the
  authenticated Supabase session after extraction.
