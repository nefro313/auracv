.PHONY: install dev run test lint format typecheck check docker

install:        ## Install all dependencies (incl. dev)
	uv sync

dev:            ## Run the API with autoreload
	uv run fastapi dev app/main.py

run:            ## Run the API (production server)
	uv run uvicorn app.main:app --host 0.0.0.0 --port 8000

test:           ## Run the test suite
	uv run pytest

lint:           ## Lint with ruff
	uv run ruff check .

format:         ## Auto-format with ruff
	uv run ruff format .
	uv run ruff check --fix .

typecheck:      ## Static type check with mypy
	uv run mypy app

check: lint typecheck test  ## Run lint + typecheck + tests

docker:         ## Build the production image
	docker build -t auracv-resume-backend .
