# resume-tailor-frontend

Next.js product UI for Resume Tailor. This frontend contains **no AI/RAG/LLM/Qdrant/LaTeX business logic** and talks to the backend via REST APIs only.

## Setup (local)
1. Install dependencies:
   - `npm install`
2. Configure environment:
   - Set `NEXT_PUBLIC_API_BASE_URL` (via `.env.local` or your shell)
3. Run:
   - `npm run dev`

Frontend URL: `http://localhost:3000`

## Environment variables
- `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8000`)

Example:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Pages
- `/` Landing
- `/banks` Experience Banks index
- `/banks/create` Create Experience Bank (upload/paste resume)
- `/banks/[bankName]/preview` Preview bank items (Postgres-backed)
- `/tailor` Tailor Resume (select bank + paste JD)
- `/settings` Theme + LLM provider settings (dev/local only for now)
- `/docs` Docs index
- `/docs/[slug]` Docs page (rendered from backend)

## Connect to backend
Start the backend (`resume-tailor-backend`) on `http://localhost:8000`, then ensure:
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`

The frontend uses `fetch()` to call backend endpoints under `/api/...` (see `lib/api.ts`).

## Lottie assets
Place dotlottie files under:
- `public/assets/loading.dotlottie`
- `public/assets/no-data.dotlottie`

Used by:
- `components/common/LoadingAnimation.tsx`
- `components/common/EmptyStateAnimation.tsx`

## Workflow progress panel
Long-running tasks return a `task_id`. The frontend polls:
- `GET /api/tasks/{task_id}/progress`

Workflow progress state is global (app-sticky) via:
- `components/workflow/workflow-progress-context.tsx`

The panel is rendered once at the app root via:
- `components/workflow/WorkflowProgressPanelHost.tsx`

## Docker
Build/run the frontend container:
- `docker build -t resume-tailor-frontend .`
- `docker run -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 resume-tailor-frontend`
