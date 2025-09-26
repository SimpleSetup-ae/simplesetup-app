# RLS Migration Guide: From Clerk to Devise/JWT

## Overview
This guide explains how to migrate your Row Level Security (RLS) policies from the incorrect Clerk-based authentication to the correct Devise/JWT authentication system used by this application.

## ⚠️ Critical Issues Fixed

### 1. **Clerk References Removed**
- **Problem**: The old RLS policies referenced `clerk_id` and assumed Clerk authentication
- **Reality**: This application uses Devise with JWT tokens, NOT Clerk
- **Solution**: All RLS policies have been rewritten to work with Devise/JWT

### 2. **OTP Security Vulnerability Fixed**
- **Problem**: OTP codes were being logged in plain text in all environments
- **Solution**: OTP codes are now only logged in development environment for debugging

## Migration Steps

### Step 1: Apply the New RLS Policies
Run the new SQL script in your Supabase SQL Editor:
```sql
-- Run the contents of: scripts/sql/DEVISE_JWT_RLS_FIX.sql
```

This will:
1. Drop all incorrect Clerk-based policies
2. Create proper RLS policies that work with your Rails/Devise/JWT setup
3. Add helper functions for setting user context

### Step 2: Update Your Rails Application
The new RLS system requires setting user context in your database sessions. Use the provided service:

```ruby
# In your controllers, use the SupabaseWithRlsService:
result = SupabaseWithRlsService.instance.with_user_context(current_user.id) do |client|
  client.from('companies').select('*').execute
end
```

### Step 3: Test the Changes

#### Test OTP Logging (Development Only)
```bash
# In development environment
rails c
# OTP codes WILL appear in logs

# In production environment  
RAILS_ENV=production rails c
# OTP codes will NOT appear in logs
```

#### Test RLS Policies
```ruby
# Test that users can only see their own data
user1 = User.first
user2 = User.second

# This should only return user1's companies
SupabaseWithRlsService.instance.get_user_companies(user1.id)

# This should only return user2's companies
SupabaseWithRlsService.instance.get_user_companies(user2.id)
```

## Architecture Overview

### How RLS Works with Devise/JWT

1. **User Authentication**: Rails authenticates users via Devise/JWT
2. **Database Connection**: Rails connects to Supabase using the service role key
3. **User Context**: Before queries, Rails sets the current user context using `set_current_user_id()`
4. **RLS Enforcement**: Supabase RLS policies use `get_current_user_id()` to filter data
5. **Context Cleanup**: After queries, the user context is cleared

### Security Considerations

1. **Service Role Key**: Keep this secure and only use it in your backend
2. **User Context**: Always clear user context after operations to prevent data leakage
3. **Admin Operations**: Use `without_context` for admin operations that need to bypass RLS
4. **Connection Pooling**: The user context is set per database session, safe with connection pooling

## Files Changed

### Security Fixes Applied:
1. `/backend/app/controllers/api/v1/inline_registrations_controller.rb` - OTP logging restricted to development
2. `/scripts/sql/DEVISE_JWT_RLS_FIX.sql` - New correct RLS policies for Devise/JWT
3. `/backend/app/services/supabase_with_rls_service.rb` - Service for handling RLS context
4. `/scripts/sql/URGENT_RLS_FIX.sql` - Marked as deprecated with warning

## Verification Checklist

- [ ] Old Clerk-based RLS policies have been dropped
- [ ] New Devise/JWT RLS policies are active
- [ ] OTP codes only appear in development logs
- [ ] Users can only access their own data
- [ ] Admin operations still work with service role key
- [ ] No references to `clerk_id` remain in the database

## Rollback Plan

If you need to rollback (not recommended due to security issues):
1. The old policies are preserved in `URGENT_RLS_FIX.sql` (but marked deprecated)
2. However, these policies will NOT work since there's no `clerk_id` column
3. It's strongly recommended to fix forward rather than rollback

## Support

If you encounter issues:
1. Check that all RLS policies were applied correctly
2. Verify that the service role key is set in your environment
3. Ensure user context is being set properly in Rails
4. Check Supabase logs for RLS policy violations