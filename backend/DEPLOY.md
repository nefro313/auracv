# Deploying the AuraCV backend to the VPS

The backend is a **stateless** FastAPI service (it only calls OpenAI and
LlamaParse over HTTP — no database, cache, or persistent volumes). It runs as a
single container behind the shared Traefik instance and is reached by the Vercel
frontend over HTTPS.

```
Vercel frontend ──HTTPS──▶ Traefik (shared) ──web network──▶ auracv-backend :8000
```

## Files

| File                       | Purpose                                              |
| -------------------------- | ---------------------------------------------------- |
| `Dockerfile`               | Multi-stage production image (uv build, non-root)    |
| `docker-compose.prod.yml`  | Production service + Traefik labels + networks       |
| `.env.prod.example`        | Template for production secrets → copy to `.env.prod`|
| `.env.prod`                | Live secrets (git-ignored, created on the VPS)       |

## Prerequisites on the VPS (one-time, already done per your standard)

These exist on the server and are **not** touched by this deployment:

- The shared `web` Docker network: `docker network create web`
- The shared Traefik instance, on `web`, with the `websecure` entrypoint and a
  `letsencrypt` certresolver.

## DNS

Point a DNS **A record** for your API hostname at the VPS public IP, e.g.

```
api.auracv.me   A   <VPS_IP>
```

Wait for it to resolve before the first deploy — Let's Encrypt validates over
HTTP, so the record must be live for the cert to issue.

## Deploy

```bash
# 1. Get the code into the project folder
cd /var/www/MyProjects
git clone <repo-url> auracv          # or: git pull in an existing checkout
cd auracv/backend

# 2. Create the production env file from the template and fill it in
cp .env.prod.example .env.prod
nano .env.prod
#   - BACKEND_DOMAIN     -> api.auracv.me   (must match the DNS record)
#   - OPENAI_API_KEY     -> live key
#   - LLAMA_CLOUD_API_KEY-> live key
#   - CORS_ORIGINS       -> your Vercel URL(s), e.g. https://auracv.me

# 3. Build and start (production build, detached)
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Adding this project required **no changes to Traefik** — it discovers the new
router from the container labels automatically, with no restart.

## Verify

```bash
# Container is up and healthy
docker compose -f docker-compose.prod.yml ps

# Logs
docker compose -f docker-compose.prod.yml logs -f backend

# Public health check (once the cert has issued — give it a minute on first run)
curl https://api.auracv.me/health     # -> {"status":"ok"}
curl https://api.auracv.me/ready      # -> status ok when both API keys are set
```

`/docs` and `/redoc` are intentionally disabled in production
(`ENVIRONMENT=production`).

## Wire up the frontend (Vercel)

Set the frontend env var to the public backend URL:

```
NEXT_PUBLIC_BACKEND=https://api.auracv.me
```

and make sure the Vercel domain is listed in `CORS_ORIGINS` in `.env.prod`.

## Update / redeploy

```bash
cd /var/www/MyProjects/auracv/backend
git pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

## Common operations

```bash
# Restart just this service
docker compose -f docker-compose.prod.yml restart backend

# Stop and remove (keeps the shared web network and Traefik intact)
docker compose -f docker-compose.prod.yml down

# Tail the last 100 log lines
docker compose -f docker-compose.prod.yml logs --tail=100 backend
```

## Networks & security notes

- The service joins **`web`** (shared, so Traefik can route to it) and
  **`auracv-internal`** (private, currently empty).
- **No host ports are published** — the API is only reachable through Traefik
  over HTTPS. `expose: 8000` makes the port visible to other containers on the
  Docker network, not to the host.
- Secrets come only from `.env.prod`, which is git-ignored and never baked into
  the image.

## Scaling later (databases, workers, etc.)

If you add stateful or internal services, put them on **`auracv-internal` only**
and give them a named volume — never add them to `web` and never publish their
ports. Example to append to `docker-compose.prod.yml`:

```yaml
  redis:
    image: redis:7-alpine
    container_name: auracv-redis
    restart: unless-stopped
    command: ["redis-server", "--appendonly", "yes"]
    networks:
      - auracv-internal          # private only — NOT on web
    volumes:
      - redis_data:/data
    # no ports / no traefik labels — internal service

volumes:
  redis_data:
```

The public `backend` service is already on `auracv-internal`, so it can reach
such a service by its container name (`redis:6379`) with no extra config.
