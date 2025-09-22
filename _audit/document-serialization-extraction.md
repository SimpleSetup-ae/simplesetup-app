## Audit Summary
- **shadcn/ui components to reuse**: N/A (backend-focused)
- **Rails patterns to follow**: PORO serializers in `lib/serializers`, controller helpers delegate to serializers, pagination, includes to avoid N+1
- **Supabase schema dependencies**: `documents` table fields used by controllers: `id, name, document_type, document_category, file_name, file_size, content_type, uploaded_at, ocr_status, verified, extracted_data, storage_path, person_id, user_id`
- **Clerk auth integration points**: None; Devise-only
- **Heroku deployment considerations**: Ensure `lib/` is in autoload/eager load paths
- **Environment variables needed**: None new
- **Database migrations required**: None
- **API endpoints to create/modify**: Replace duplicated serialization in `ApplicationsController`, `DocumentsController`, `CompaniesController` with `DocumentSerializer`

## Scope & Current Findings
- Duplicate `serialize_document` methods exist in:
  - `backend/app/controllers/api/v1/applications_controller.rb`
  - `backend/app/controllers/api/v1/documents_controller.rb`
  - `backend/app/controllers/api/v1/companies_controller.rb`
- Admin view requires richer fields (URLs, flags); general view needs minimal fields.

## Plan
1. Add `config.autoload_paths` and `eager_load_paths` for `lib/` in `backend/config/application.rb`.
2. Create `lib/serializers/base_serializer.rb` and `lib/serializers/document_serializer.rb`.
3. Update controllers to delegate to `DocumentSerializer` and remove duplicate logic.
4. Keep response shapes identical; add tests later.

## Risks & Mitigations
- Risk: Response shape drift.
  - Mitigation: Preserve keys and formats; do contract snapshot tests.
- Risk: URL generation errors.
  - Mitigation: Guard Supabase URL calls and fallback to nil; log warnings.

## Verification Checklist
- [ ] Documents index returns identical JSON keys/order (order not guaranteed in JSON but keys present)
- [ ] Admin application serialization includes all previous fields
- [ ] No N+1 queries introduced


