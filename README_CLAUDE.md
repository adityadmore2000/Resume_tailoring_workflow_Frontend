# resume-tailor-frontend

Next.js product UI for Resume Tailor. This frontend contains **no AI, RAG, LLM, Qdrant, or LaTeX business logic** — all of that lives in the backend. The frontend is purely a UI layer that talks to the backend via REST.

---

## Quick Start (Local)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Edit NEXT_PUBLIC_API_BASE_URL if your backend is not on localhost:8000
```

### 3. Run the dev server

```bash
npm run dev
```

Frontend available at: `http://localhost:3000`

The backend (`resume-tailor-backend`) must be running at the URL specified by `NEXT_PUBLIC_API_BASE_URL`. Start it with `uvicorn app.main:app --reload --port 8000` before using the frontend.

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend base URL. Default: `http://localhost:8000` |

Example `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

All backend calls are made through `lib/api.ts` using `fetch()` against paths under `/api/...`.

---

## Pages

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/banks` | Experience Banks index — lists all registered banks |
| `/banks/create` | Create a new Experience Bank (upload or paste master resume) |
| `/banks/[bankName]/edit` | Edit bank files and re-ingest into the vector store |
| `/tailor` | Tailor a resume — select a bank and paste a JD |
| `/settings` | Theme and LLM provider configuration (dev/local only for now) |
| `/docs` | Documentation index |
| `/docs/[slug]` | Individual doc page, rendered from backend |

---

## Long-Running Tasks

Bank creation and tailoring are background jobs. When a job is submitted, the backend returns a `task_id`. The frontend polls for progress:

```
GET /api/tasks/{task_id}/progress
```

Progress state is managed globally (app-sticky) so it persists across page navigations:

- State container: `components/workflow/workflow-progress-context.tsx`
- Panel renderer (mounted once at app root): `components/workflow/WorkflowProgressPanelHost.tsx`

This means a tailoring job started on `/tailor` will still show its progress if the user navigates to `/banks` while waiting.

---

## Static Assets

Lottie animation files go under `public/assets/`:

| File | Used by |
|---|---|
| `public/assets/loading.dotlottie` | `components/common/LoadingAnimation.tsx` |
| `public/assets/no-data.dotlottie` | `components/common/EmptyStateAnimation.tsx` |

These files are not included in the repo and need to be added manually.

---

## Docker

Build and run the frontend container standalone:

```bash
docker build -t resume-tailor-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 resume-tailor-frontend
```

For the full stack (frontend + backend + Qdrant + Ollama), use `docker compose` from the backend repo. See [`resume-tailor-backend/README_CLAUDE.md`](../resume-tailor-backend/README_CLAUDE.md) for details.
