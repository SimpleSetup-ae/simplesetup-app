## Audit Summary
- **shadcn/ui components to reuse**: `Card`, `Badge`, `Select`, `Table`, `Dialog`, and `DashboardLayout` already power `frontend/src/app/admin/applications/page.tsx` and `frontend/src/app/admin/companies/page.tsx`; no new UI primitives required.
- **Rails patterns to follow**: `Api::V1::Admin::CompaniesController#index` currently scopes `Company` records to `['formed','active','issued']` and serializes via `serialize_admin_company`; stats computed in `calculate_company_stats`. Admin application updates live in `Api::V1::ApplicationsController#admin_update`.
- **Supabase schema dependencies**: `companies` table holds statuses (`approved`, `formed`, etc.) plus metadata like `license_number`, `estimated_annual_turnover`, timestamps (`approved_at`, `formed_at`). No new tables required.
- **Authentication integration points**: Admin APIs rely on `require_admin` before action (JWT via `Api::V1::BaseController`); existing flow should be reused for company listing.
- **Heroku deployment considerations**: Changes limited to API serialization logic and frontend admin pages; no deployment config updates needed.
- **Environment variables needed**: None beyond existing API base URLs; frontend fetches via `http://localhost:3001` in dev.
- **Database migrations required**: None; status value `approved` already present in `Company::STATUSES` enum and schema includes `approved_at`.
- **API endpoints to create/modify**: Update `Api::V1::Admin::CompaniesController#index` (and `calculate_company_stats`) to include `approved` companies; ensure frontend `admin/companies` page handles `approved` status badge and displays detailed data consistent with applications view.

