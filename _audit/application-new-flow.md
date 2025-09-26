## Audit Summary
- **shadcn/ui components to reuse**: `StandardFormLayout`, `FormSection`, `PricingBanner`, `UserSignUpStep`, `PassportUpload`, `ui/*` (Card, Button, Input, Select, Tabs, Alert, Badge, Skeleton)
- **Rails patterns to follow**: RESTful `ApplicationsController` with `create/show/update/progress/claim/submit` plus admin endpoints; `InlineRegistrationsController` for in-flow signup + verification; model-centric transforms in `Company` and submission-time transformation in controller; serializers for client vs admin (`DocumentSerializer`, custom `serialize_*`).
- **Supabase schema dependencies**: Tables `companies`, `application_progress`, `people`, `documents`; storage via `SupabaseStorageService` for document URLs; activity catalog in `business_activities` (search endpoint not present—see debt).
- **Authentication integration points**: Anonymous draft creation + `draft_token` cookie; inline registration flow issuing `temp_token` JWT; attribution via `Company#claim_by_user!` when phone verified or skipped; API uses cookie session/JWT, frontend also stores `auth_token` in `localStorage` (mismatch—see debt).
- **Heroku deployment considerations**: Ensure CORS and cookie settings (secure/httponly) for `draft_token` in production; email (SendGrid) for OTP verification.
- **Environment variables needed**: SendGrid flags (e.g., `ENABLE_SENDGRID`), JWT secret, Devise keys; Supabase storage credentials.
- **Database migrations required**: None for current flow; verify indexes used: `companies.draft_token` unique, `application_progress.company_id` unique, GIN indexes for JSONB arrays used.
- **API endpoints to create/modify**: Missing business activity search endpoint (`GET /api/v1/business_activities/search`); consider `GET /api/v1/applications?draft_token=...` or adjust frontend; tighten access control on `ApplicationsController#show` for anonymous drafts; fix `notify_client` boolean handling in admin update.

---

## End-to-End Flow: `/application/new` through submission

### 0) Entry: `/application/new` (Next.js)
- Creates anonymous draft via `POST /api/v1/applications` with `{ free_zone: 'IFZA', formation_type: 'new_company' }`.
- Backend creates `Company` with:
  - `status = 'anonymous_draft'`
  - `draft_token` (random, also set to `cookies[:draft_token]` httponly)
  - `application_progress` row initialized `step=0, percent=0`
- Frontend stores `application_id` in `localStorage`, optionally `draft_token` too, then redirects to `/application/{id}/start`.

### 1) Start: `/application/[id]/start`
- Loads application (context), sets progress `step=0, page='start'` via `PATCH /applications/:id/progress`.
- CTA continues to license.

### 2) License & Visas: `/application/[id]/license`
- Captures `trade_license_validity`, `visa_package`, allocations (`inside_country_visas`, `outside_country_visas`), `establishment_card`, partner visas, etc.
- Saves via debounced `PATCH /applications/:id` with both direct fields and `form_data` under step `'license'`. Server writes permitted top-level fields and merges autosave to `companies.auto_save_data` with `last_auto_save_at`.
- Sets progress `step=1, page='license'`.
- If unauthenticated, navigates to inline signup step `/application/[id]/signup`; else continues to activities.

### 2b) Inline Signup: `/application/[id]/signup`
- Component `UserSignUpStep` handles signup and signin:
  - Sign Up: `POST /api/v1/inline_registrations` with `draft_token`. Returns `temp_token` (JWT) and `next_step = 'email_verification'`.
  - Email verification: `POST /api/v1/inline_registrations/verify_email` with `temp_token` + `otp_code` -> returns new `temp_token` (`step='phone_capture'`).
  - Phone capture (or skip): `POST /api/v1/inline_registrations/update_phone` (or `skip_phone`) with `temp_token`. Issues full `token` (JWT) and, if `draft_token` present, calls `Company#claim_by_user!` to attribute the draft to the new user and clears `draft_token`.
  - Sign In: `POST /api/v1/auth/authenticate` with `draft_token` supports OTP or direct login; on success proceeds with `nextStep` accordingly.
- On completion, user is redirected to `/application/[id]/activities`.

### 3) Activities: `/application/[id]/activities`
- Allows selecting activities (first 3 free) and setting `main_activity_id`.
- Saves autosave under step `'activities'` and permitted fields. Sets progress `step=2, page='activities'`.
- Note: Frontend calls `GET /api/v1/business_activities/search`; server route is missing (debt).

### 4) Names: `/application/[id]/names`
- Collects `name_options` (up to 3) and optionally `name_arabic` (auto-translate helper).
- Saves step `'names'`. Sets progress `step=3, page='names'`.

### 5) Shareholding: `/application/[id]/shareholding`
- Captures `share_capital`, `share_value`, `shareholding_type`, voting options, etc.
- Saves step `'shareholding'`. Sets progress `step=4, page='shareholding'`.

### 6) Members: `/application/[id]/members`
- Captures `shareholders` and `general_manager` (director), with `PassportUpload` enabling OCR extraction.
- Validates 100% total shareholding, required fields for individuals/corporates.
- Saves step `'members'`. Sets progress `step=5, page='members'`.
- Routes next to `/ubos` if shareholding requires, else to `/review`.

### 7) UBOs: `/application/[id]/ubos`
- For corporate/mixed types, capture UBOs; collects `gm_signatory_name`, `gm_signatory_email`, `ubo_terms_accepted`.
- Saves step `'ubos'`. Sets progress `step=6, page='ubos'`.

### 8) Review & Submit: `/application/[id]/review`
- Validates completeness across sections client-side. Sets progress `step=7, page='review'`.
- On submit:
  - Context first performs a final flush: `PATCH /applications/:id` with `form_data` and `step_name='final_flush'` to persist latest autosave snapshot.
  - `POST /applications/:id/submit` then executes server-side:
    1. `transform_auto_save_data_to_records!`:
       - Flattens autosave; maps `business_activities` to `companies.activity_codes` array.
       - Creates `people` rows for shareholders and director (GM), clearing existing before insert.
       - Prepares `update_params` for `companies` (e.g., `name_options`, `gm_signatory_name`, `ubo_terms_accepted`, license/shareholding fields).
       - Updates `Company` atomically; reloads associations.
    2. Validates via `CompanySubmissionValidator`:
       - Requires: license validity, activities, name options, share capital, at least one shareholder and director, GM signatory name, UBO terms accepted.
       - Ensures nationality and passport numbers for shareholders/directors.
    3. On success: sets `status='submitted'`, `submitted_at`, `formation_step='submitted'`, updates `application_progress` to 100%.
    4. Sends confirmation email if `owner` present.

---

## Persistence Map (DB)

- Table: `companies`
  - Creation (anonymous draft): `id`, `status='anonymous_draft'`, `free_zone`, `formation_type`, `draft_token`, timestamps.
  - Autosave during steps: updates permitted scalar fields; also persists JSON snapshot in `auto_save_data` with `last_auto_save_at`.
  - Progress updates: `formation_step` reflects current page, while actual progress is in `application_progress`.
  - Submission-time update: sets `status='submitted'`, `submitted_at`; applies merged fields (`name_options`, `gm_signatory_name`, `ubo_terms_accepted`, license/shareholding fields); converts activities to `activity_codes`.

- Table: `application_progress`
  - Tracks `step` (0..7), `percent` (0..100), `current_page`, `last_activity_at`, optional `page_data`.

- Table: `people`
  - On submission, rebuilt from autosave data:
    - `type='shareholder'` for shareholders (individual or corporate with metadata)
    - `type='director'` with `appointment_type='general_manager'` for GM
    - Fields: names, nationality, passport details, `share_percentage`, `contact_info`, `metadata`

- Table: `documents`
  - Uploaded via `PassportUpload`; `DocumentSerializer` provides different views for client/admin. Storage path used to generate signed URLs via Supabase.

---

## Anonymous-to-User Attribution

- Draft creation sets a unique `draft_token` on the `Company` and an httponly cookie.
- Inline registration flow carries `draft_token` within `temp_token` JWT across email and phone steps.
- Upon phone capture (or skip), server issues full JWT and calls `Company#claim_by_user!` if the draft is still anonymous, setting `owner`, `status='draft'`, and clearing `draft_token`.
- There is also a `POST /applications/:id/claim` endpoint that validates `params[:draft_token]` against the company and attributes to `current_user`.

---

## Admin Dashboard (Applications Tab)

- Listing: `GET /api/v1/applications/admin`
  - Scope: `Company.admin_viewable` (statuses: `submitted`, `under_review`, `information_required`, `processing`, `approved`, `formed`, `active`).
  - Includes owner, application_progress, documents; supports simple filters (`status`, `free_zone`) and pagination.
  - Serializer `serialize_admin_application` returns: id, companyName (first `name_option` fallback to `company.name`), freeZone, status, submittedAt/createdAt/updatedAt, `userEmail`, `userFullName`, `isAnonymous`, packageType (derived), `estimatedAnnualTurnover`, completionPercentage, documentCount, lastActivity.

- Detail view: `GET /api/v1/applications/admin/:id`
  - Returns `serialize_full_admin_application`, which builds on the full client view plus:
    - `owner` via `UserSerializer`
    - License fields
    - `all_documents` via `DocumentSerializer` with `admin: true` (exposes `extracted_data`)
    - `activity_details` resolved from `business_activities`

- Update: `PATCH /api/v1/applications/admin/:id`
  - Can change `status` and set timestamps (approved/rejected/formed/active), update `license_data`, optionally notify client.
  - Note: `notify_client` strict boolean check may ignore string values (see debt).

---

## Client/Company Creator Visibility

- Listing: `GET /api/v1/applications` (requires auth)
  - Returns owned companies with concise `serialize_application` (id, name, status, free_zone, formation_step, submitted_at, progress/current_step, has_unsaved_changes).

- Draft/Detail: `GET /api/v1/applications/:id` (no auth required by controller)
  - Returns `serialize_full_application`:
    - Flattens `auto_save_data` into `form_data` for client display
    - Merges DB fields and autosave values (e.g., license/shareholding, members, activities)
    - Includes `documents` via `DocumentSerializer.collection(..., include_urls: false)`; individual `GET /documents/:id` includes signed URL

---

## Technical Debt and Risks

1) Access control gap on `GET /api/v1/applications/:id` for anonymous users
- Controller skips auth and fetches by `id` first; it only enforces `can_be_accessed_by?` when `current_user` is present.
- Result: Any unauthenticated client who knows a UUID can fetch full application data. UUIDs are hard to guess but this is still a security weakness.
- Recommendation: For unauthenticated requests, require a matching `cookies[:draft_token]` for anonymous drafts, and forbid access for non-anonymous or mismatched tokens. Alternatively, always require auth for `show` except when verified by `draft_token`.

2) Frontend attempts to load by `draft_token` via `GET /api/v1/applications?draft_token=...`
- No such endpoint/param exists; `index` expects authenticated user and ignores `draft_token`.
- Recommendation: Either implement `GET /api/v1/applications/draft` (by cookie) or remove this code path and rely on known `id`.

3) Business activity search endpoint missing
- Frontend calls `GET /api/v1/business_activities/search`, but no controller/route is present.
- Recommendation: Add a controller action for search with proper scopes and pagination, or adjust frontend to available endpoints.

4) Token/storage inconsistency
- Frontend stores `auth_token` in `localStorage` but fetches rely on `credentials: 'include'` (cookie-based). No `Authorization` header is set.
- Recommendation: Standardize on cookie session or bearer JWT headers; remove unused `localStorage` token or wire it into requests.

5) `notify_client` boolean handling in admin update
- Checked strictly with `params[:notify_client] == true`; JSON booleans may arrive as strings, causing condition to fail.
- Recommendation: Cast to boolean (`ActiveModel::Type::Boolean.new.cast(params[:notify_client])`).

6) Autosave writes permitted fields directly during draft
- Current `PATCH /applications/:id` updates top-level fields immediately and also stores `form_data` in `auto_save_data`.
- This is acceptable, but be mindful of partial/invalid intermediate states; ensure admin views account for draft data.

7) UBO completeness not enforced beyond terms and GM name
- Validator requires `gm_signatory_name` and `ubo_terms_accepted`, but does not enforce UBO entries/structure when `shareholding_type` is corporate/mixed.
- Recommendation: Extend validator to require UBO data if applicable.

8) Mixed draft token storage
- `draft_token` is set as httponly cookie (good), but frontend also writes to `localStorage` in some places.
- Recommendation: Prefer cookie-only for security; avoid duplicating in `localStorage`.

9) Admin Application Name fallback
- Admin list uses `name_options.first` or `company.name`; newly-created drafts set `name = 'Draft Application'` until later.
- Consider computing a safer display name (e.g., external ref) before names are provided.

10) Email/OTP flows
- Inline registration logs OTP to server logs on failure to send; ensure production logging policy avoids sensitive data exposure.

---

## What’s Saved Along the Way vs At Submission

- Along the way (autosave):
  - Permitted scalar fields written to `companies` immediately where allowed
  - Step data merged into `companies.auto_save_data[step_name]`
  - Progress tracked in `application_progress`

- At submission:
  - Autosave flattened; activities mapped into `companies.activity_codes`
  - `people` rows created for shareholders and GM
  - `companies` updated with consolidated fields (`name_options`, `gm_signatory_name`, `ubo_terms_accepted`, etc.)
  - `companies.status = 'submitted'`, `submitted_at`, `formation_step = 'submitted'`, progress to 100%

---

## Admin vs Client Visibility Summary

- Admin sees: all admin-viewable applications with enriched details and `extracted_data` in documents; can update status and license data, and notify client.
- Client/creator sees: their own applications via `index`; full draft data via `show` (currently possible even without auth—see Debt #1); document lists without extracted internals unless fetching individual item with URL generation.

---

## Recommended Remediations (Priority)
1. Lock down `ApplicationsController#show` for unauthenticated access—require `draft_token` match or auth.
2. Implement `business_activities#search` API or adjust frontend.
3. Fix frontend `draft_token`-based loader to use supported API or remove.
4. Normalize auth—either cookie-only or bearer token; stop writing `auth_token` to `localStorage` if unused.
5. Harden admin update boolean parsing for `notify_client`.
6. Extend submission validator for UBO completeness when required.



