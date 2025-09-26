## Audit Summary
- **shadcn/ui components to reuse**: `Card`, `Button`, `Badge`, `Input`, `Select`, `Table`, `Dialog`, `Label`, `Checkbox`, plus layout wrapper `components/dashboard/dashboard-layout`.
- **Rails patterns to follow**: `Api::V1::BaseController` includes `ErrorHandler` and `JwtAuthenticatable` with `before_action` guards and `X-Request-ID` header. `ApplicationController` still defines Devise-style `authenticate_user!`/`user_signed_in?` hooks, creating overlap with JWT concern.
- **Supabase schema dependencies**: RLS policies defined in `scripts/sql/URGENT_RLS_FIX.sql` on `users`, `companies`, `company_memberships`, `documents`, `people`, `requests`, `workflow_instances`, `workflow_steps`. Policies reference `users.clerk_id` and `auth.uid()`.
- **Clerk auth integration points**: Residual references in RLS SQL and repo rules (`.cursorrules`) despite refactor notes stating Clerk was removed. Potential mismatch between DB policies and current JWT-based auth.
- **Heroku deployment considerations**: Ruby buildpack; Rails API deploy to `simplesetup-app`. Ensure config vars mirror single `.env` structure and CORS origins include frontend domains.
- **Environment variables needed**: API base URL for frontend, JWT secret/issuer/audience for backend, CORS origins, Supabase service key (backend only). Do not add or alter existing `.env` without explicit values.
- **Database migrations required**: If Clerk fully removed, drop or migrate `users.clerk_id`. Add any missing indexes to support common joins on `companies` and `company_memberships`. Align FK constraints and timestamps per Rails conventions.
- **API endpoints to create/modify**: Standardize session check endpoint (`GET /api/v1/auth/me`) used by middleware; audit `admin/users` endpoints for consistent response shape `{ success, data|error, request_id }` and authorization checks.

---

## Top 5 Technical Debt Areas and Recommendations

1) Authentication duplication and inconsistency (Devise vs JWT vs Clerk)
- What: `ApplicationController` enforces `authenticate_user!` while `Api::V1::BaseController` uses `JwtAuthenticatable`. RLS policies and rules mention Clerk; middleware hits `/auth/me` every request.
- Recommendation: Consolidate on `JwtAuthenticatable` for API-only controllers. Remove Devise-style hooks in `ApplicationController` (or isolate Devise to web-only). Purge Clerk references in code/docs. Define a single source-of-truth session check (`/api/v1/auth/me`) and shared helper for responses.
- Significance: High. Reduces security gaps, prevents double-auth bugs, and simplifies mental model across frontend and backend.

2) Frontend API access: hardcoded URLs and scattered fetch logic
- What: Multiple inline `fetch('http://localhost:3001/...')` with manual headers/toasts and no typed responses.
- Recommendation: Create `frontend/src/lib/api/client.ts` with base URL from env, credential handling, standardized error mapping, and typed helpers. Centralize endpoints (admin users, auth, companies) and reuse in pages/components.
- Significance: High. Improves maintainability, environment portability, and error handling consistency; reduces duplication.

3) Supabase RLS policies tied to Clerk IDs
- What: `URGENT_RLS_FIX.sql` policies depend on `users.clerk_id = auth.uid()`, conflicting with current JWT-based auth and Clerk removal claims.
- Recommendation: Choose one approach:
  a) If database is accessed only via backend: move to service key on backend and simplify RLS to app-level authorization (using backend user IDs), or implement Postgres JWT verification that encodes `user_id` in `jwt.claims`.
  b) If the frontend directly queries Supabase: migrate policies to use your active auth provider and claims (drop `clerk_id`).
- Significance: High. Prevents data leakage and broken access control; aligns DB security with app auth.

4) Response contracts and serialization consistency
- What: Mixed response formats (`{ success, users, stats }` vs `{ success, message }`) and ad-hoc error payloads. Serializers and `ErrorHandler` exist but may not be applied uniformly.
- Recommendation: Standardize API contract: `{ success: boolean, data?: {...}, error?: { code, message, details? }, request_id }`. Ensure all controllers use serializers in `app/serializers` and include `request_id` via `ErrorHandler`.
- Significance: Medium-High. Enables predictable clients, simpler logging/monitoring, and easier integration tests.

5) Next.js middleware per-request backend auth check
- What: Edge middleware performs a blocking fetch to `/auth/me` on every protected route navigation, adding latency and coupling to backend availability.
- Recommendation: Move to signed, httpOnly session cookie validated in middleware without network I/O (e.g., verify signature only), or defer auth to server components/layouts for protected trees with a lightweight cache. Limit middleware checks to top-level protected segments only.
- Significance: Medium. Improves performance and resilience; reduces unnecessary backend load.

---

## Suggested Next Steps
- Align DB policies with the active auth model; schedule a safe migration for `users.clerk_id` if deprecated.
- Introduce a typed API client and replace hardcoded URLs incrementally (start with admin users flows).
- Normalize API responses and ensure `ErrorHandler` + serializers are applied across controllers.
- Simplify `ApplicationController` auth responsibilities and fully adopt `JwtAuthenticatable` in API namespace.
- Rework middleware/session strategy to cut cross-network checks on every request.
