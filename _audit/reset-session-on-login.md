## Audit Summary
- **shadcn/ui components to reuse**: None – change remains in backend authentication.
- **Rails patterns to follow**: `Api::V1::AuthController#login` performs Devise `sign_in` and writes `request.session[:user_id]`; JWT fallback handled in `JwtAuthenticatable`; OTP flow (`Api::V1::OtpController#verify_otp`) also uses Devise session helpers.
- **Supabase schema dependencies**: None.
- **Authentication integration points**: Devise session cookie (`_simple_setup_session`), `sign_in`/`sign_out`, JWT helper concern for token-based auth.
- **Heroku deployment considerations**: None beyond standard deploy; no config changes.
- **Environment variables needed**: None.
- **Database migrations required**: None.
- **API endpoints to create/modify**: Update `POST /api/v1/auth/sign_in` (`Api::V1::AuthController#login`) to reset the session prior to authenticating a user.

