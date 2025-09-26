## Audit Summary
- **shadcn/ui components to reuse**: `StandardFormLayout`, `Card`, `CardContent`, `Button`, `Input`, `Label`, `Alert`, `Badge`, `Loader2` icon usage in `frontend/src/app/application/[id]/names/page.tsx`
- **Rails patterns to follow**: Existing `Api::V1::TranslationsController` (`POST /api/v1/translations/arabic`, `GET /api/v1/translations/limit`); translation throttling logic on `User` model (`translation_requests_count` helpers); autosave via `Api::V1::ApplicationsController#update`; service object pattern in `TranslationService`
- **Supabase schema dependencies**: `users.translation_requests_count`, `users.translation_requests_reset_at`, and `companies.name_arabic` already present (see `backend/db/schema.rb`); no new tables or policies required
- **Authentication integration points**: `TranslationsController` skips JWT but calls `current_user` helpers when signed in; `JwtAuthenticatable` mixin provides `current_user`; ensure any translation counter helpers are callable from controllers
- **Heroku deployment considerations**: Confirm `OPENAI_API_KEY`, `GOOGLE_TRANSLATE_API_KEY` / `GOOGLE_GEMINI_API_KEY` remain configured for production fallbacks; no buildpack updates needed
- **Environment variables needed**: `OPENAI_API_KEY` (primary), `GOOGLE_TRANSLATE_API_KEY` or `GOOGLE_GEMINI_API_KEY` for fallbacks; no changes to existing `.env`
- **Database migrations required**: None — persistence columns already exist
- **API endpoints to create/modify**: Reuse `POST /api/v1/translations/arabic` and `GET /api/v1/translations/limit`; ensure `PATCH /api/v1/applications/:id` persists `name_arabic` via autosave

