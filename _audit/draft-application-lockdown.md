## Audit Summary

- **Objective**: Lock down the anonymous application draft flow so only the browser owning the `draft_token` (or the authenticated owner) can read/update/submit drafts.
- **Current Risk**: `Api::V1::ApplicationsController` allows `show/update/progress/submit` by `id` without verifying the `draft_token`. Anyone with an ID can modify a draft prior to claim.
- **Scope**: Rails API (`applications_controller`, `company` model), FE `ApplicationContext`, cookies handling, auth concerns.

### What We Have
- **Token storage**: `companies.draft_token` (unique, indexed). Generated for `anonymous_draft` companies. Cleared on claim.
- **Cookie**: On draft creation, backend sets `cookies[:draft_token]` (httponly, secure in prod).
- **Controller**: `ApplicationsController#set_company` looks up by `id` first, only falls back to cookie `draft_token` if not found. No token match requirement when `id` is present. Public actions skip both Devise and JWT.
- **Claiming**: `POST /api/v1/applications/:id/claim` correctly checks `params[:draft_token]` and `anonymous_draft?` before claim.
- **Frontend**: `ApplicationContext` creates drafts and relies on cookies with `credentials: 'include'`. No `Authorization` header. Middleware treats `/application` routes as public.
- **Auth landscape**: Dual Devise session + JWT concern in API; `AuthController#me` expects Devise session; OTP flow issues JWT but FE does not use it.

### Dependencies and Patterns
- **shadcn/ui components to reuse**: `AuthenticationModal` (OTP/password), `AuthGuard`, `auth-provider`, `ApplicationContext` for flow state.
- **Rails patterns to follow**: Use `Api::V1::BaseController` for API concerns; rely on `Company#can_be_accessed_by?` for member/owner checks; consistent JSON error shapes with `request_id`.
- **Supabase schema dependencies**: `companies.draft_token` (unique), `companies.auto_save_data`, `application_progress` table; no schema change required.
- **Authentication integration points**: `JwtAuthenticatable` concern, Devise cookie sessions, OTP endpoints; FE calls use cookies only.
- **Heroku deployment considerations**: None specific beyond cookie `secure` flag in prod and CORS.
- **Environment variables needed**: `SECRET_KEY_BASE`, `CORS_ORIGINS`, `NEXT_PUBLIC_API_URL` (FE should consistently use this).
- **Database migrations required**: None; indexes in place.
- **API endpoints to create/modify**: Harden `ApplicationsController` (`show`, `update`, `progress`, `submit`) and `set_company` to enforce draft token for anonymous drafts; optionally accept token via param for non-browser clients.

## Risks
- Tightening access may break existing anonymous sessions if the cookie is missing or blocked; however, draft creation sets the cookie and FE uses `credentials: 'include'`.
- After claim, `draft_token` is nil; access must require authenticated user membership/ownership.

## Step-by-Step Plan

1) Backend: Centralize draft-token verification
- Add a small helper in `ApplicationsController` (or `Api::V1::BaseController`) to fetch the effective draft token from `cookies[:draft_token]` or `params[:draft_token]`.
- Prefer lookup by `draft_token` for unauthenticated contexts; if `id` is provided, require that the company is either:
  - non-anonymous and accessible by `current_user`, or
  - anonymous and its `draft_token` matches the effective token.
- Return 403 on mismatch; 404 only when not found.

2) Modify `set_company` resolution order
- If `current_user` present: allow `id` lookup, then enforce `can_be_accessed_by?(current_user)` for non-anonymous companies.
- If no `current_user`: require a present draft token; lookup by token first; if `id` is used, verify the company’s `draft_token` matches the token.

3) Action-level guardrails (defense in depth)
- At the start of `show/update/progress/submit`, short-circuit if company is anonymous and token mismatch (use the helper). Keep action code unchanged otherwise.

4) Response consistency
- Use `status: :forbidden` (403) for token mismatch or unauthorized access; include `request_id` header already set by `BaseController`.

5) Frontend verification
- `ApplicationContext` already relies on cookies; no required changes. Optionally, read `draft_token` from cookie and include as a request param for resilience.

6) Tests
- Add request specs:
  - Create draft → cookie set → can `show/update/progress` with cookie.
  - Access by `id` without cookie → 403.
  - Access by `id` with wrong token → 403.
  - After claim → require authenticated user; cookie no longer grants access.

7) Rollout
- Branch: `feature/lockdown-anon-application-drafts`.
- Manual QA of FE flow: new draft, refreshes, resume via cookie; attempt cross-tab without cookie; attempt by raw `id`.
- No migrations/env changes; deploy normally.

## Notes for Future Consolidation (not in scope for this change)
- Unify on Devise cookies or JWT end-to-end to remove inconsistencies.
- Make `/auth/me` authoritative and consistent with chosen mechanism.
- Single source of truth for protected routes in FE.


