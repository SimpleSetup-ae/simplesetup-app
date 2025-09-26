## Audit Summary
- **shadcn/ui components to reuse**: `StandardFormLayout`, `FormSection` (patterns), `Card`, `Button`, `Input`, `Label`, `Alert`, `Badge`, `PricingBanner`
- **Rails patterns to follow**: Use existing `Api::V1::TranslationsController` with `POST /api/v1/translations/arabic` and `GET /api/v1/translations/limit`; service object pattern via `TranslationService`
- **Supabase schema dependencies**: None for this feature; no tables or RLS changes required
- **Authentication integration points**: Translation endpoints skip auth but respect per-user limits if authenticated; anonymous users have generous limits; no changes to Devise/JWT needed
- **Heroku deployment considerations**: Ensure config vars for translation providers (`OPENAI_API_KEY`, `GOOGLE_TRANSLATE_API_KEY` or `GOOGLE_GEMINI_API_KEY`) are set; no buildpack changes
- **Environment variables needed**: `OPENAI_API_KEY` (primary), `GOOGLE_TRANSLATE_API_KEY` (fallback) or `GOOGLE_GEMINI_API_KEY` (fallback). No modifications to existing .env values per project rules
- **Database migrations required**: None
- **API endpoints to create/modify**: Reuse existing endpoints; harden prompt and constraints in `TranslationService` only (no route changes)


