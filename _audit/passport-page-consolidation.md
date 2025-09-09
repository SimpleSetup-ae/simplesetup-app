## Audit Summary
- **shadcn/ui components to reuse**: Keep `PassportUpload` (frontend/src/components/workflow/documents/PassportUpload.tsx) used by `workflow/passport-demo`. Remove `SimplePassportUpload` (minimal test-only component).
- **Rails patterns to follow**: No backend changes required for consolidation. Existing API routes in `backend/config/routes.rb` under `api/v1/documents/passport/*` remain the integration points.
- **Supabase schema dependencies**: None for this UI consolidation. RLS-specific migrations were skipped locally; not relevant to UI component removal.
- **Clerk auth integration points**: `PassportUpload` includes Authorization header (`Bearer ${localStorage.getItem('auth_token')}`) when calling backend endpoints. No change required.
- **Heroku deployment considerations**: No server changes; only frontend route cleanup. No new buildpacks/config needed.
- **Environment variables needed**: Frontend uses `NEXT_PUBLIC_API_URL` with fallback to `http://localhost:3001` for API calls. No changes.
- **Database migrations required**: None.
- **API endpoints to create/modify**: None. Continue using:
  - POST `/api/v1/documents/passport/extract`
  - POST `/api/v1/documents/passport/fraud-check`

### Decision
- Keep: `http://localhost:3000/workflow/passport-demo` (feature-complete, uses `PassportUpload` with OCR + fraud flow and progress UI)
- Remove: `http://localhost:3000/test-passport` and `SimplePassportUpload` (debug/test-only UI)

### Impact
- Eliminates duplicate UI paths, reduces confusion.
- No breaking imports elsewhere (only `test-passport` references `SimplePassportUpload`).

### Follow-up (optional)
- If external docs reference `/test-passport`, consider adding a redirect to `/workflow/passport-demo` in Next.js config.

