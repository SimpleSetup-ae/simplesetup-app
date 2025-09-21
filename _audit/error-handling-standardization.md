## Audit Summary
- **shadcn/ui components to reuse**: N/A (backend-focused)
- **Rails patterns to follow**: Concern-based error handling, `rescue_from` in base controller, request ID propagation
- **Supabase schema dependencies**: None
- **Clerk auth integration points**: None; Devise-only
- **Heroku deployment considerations**: Ensure logs include request IDs
- **Environment variables needed**: None
- **Database migrations required**: None
- **API endpoints to create/modify**: Apply consistent error payloads across all API controllers

## Current Findings
- Mixed error responses in controllers (`{ error: '...' }`, `{ success: false, message: ... }`)
- Missing `request_id` in error payloads for supportability
- Inconsistent status codes (400 vs 422; 401 vs 403)

## Plan
1. Create `app/controllers/concerns/error_handler.rb` with standardized handlers.
2. Include in `Api::V1::BaseController` and set request id header.
3. Update controllers gradually to rely on standardized error responses.

## Risks & Mitigations
- Risk: Frontend relies on legacy message shapes.
  - Mitigation: Maintain `{ success: false }` and `message` alongside `error` for transition.
- Risk: Over-catching hides useful stack traces.
  - Mitigation: In development, include exception message; log full backtrace.

## Verification Checklist
- [ ] 404, 401, 403, 422, 409, 500 return standardized payload with `request_id`.
- [ ] Frontend error handler paths verified.
- [ ] Logs include request path, user id, and request id.


