## Audit Summary
- **shadcn/ui components to reuse**: Existing `Input`, `Label`, `Button`, `Alert`, and `Card` variants in `frontend/src/app/sign-in/page.tsx`; `AuthProvider` and `PageAuthCheck` patterns for auth state management.
- **Rails patterns to follow**: `Api::V1::AuthController#login` for password auth; Devise-backed `Users::SessionsController`; JSON responses serialized via `UserSerializer`; session handling through `ApplicationController` `authenticate_user!` override.
- **Supabase schema dependencies**: `users` table seeded with admin demo account (`db/seeds/demo_users.rb`); relies on email uniqueness and Devise fields (password, confirmed_at, lockable counters).
- **Authentication integration points**: Frontend `signIn` helper in `frontend/src/lib/auth.ts` posting to `/api/v1/auth/sign_in`; `AuthProvider` invoking `getCurrentUser`; Devise configuration enforcing `case_insensitive_keys` and `strip_whitespace_keys` for email; login seeds for `admin@simplesetup.ae`.
- **Heroku deployment considerations**: Ensure Devise session cookies and CORS settings (`config/initializers/cors.rb`) remain compatible; no deployment-specific overrides identified.
- **Environment variables needed**: `NEXT_PUBLIC_API_URL` for frontend API base; Devise secrets (`DEVISE_SECRET_KEY`) and Rails `SECRET_KEY_BASE`; OAuth keys if social login impacted.
- **Database migrations required**: None anticipated; admin user already seeded and schema supports Devise lockable/confirmable fields.
- **API endpoints to create/modify**: Likely adjust existing `/api/v1/auth/sign_in` (and possibly `/api/v1/auth/me`) to ensure lowercase email handling and admin session persistence; verify no new endpoints needed.


