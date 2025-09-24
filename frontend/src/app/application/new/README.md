# Application New Page - Critical Routing Documentation

## ⚠️ CRITICAL: ROUTING ISSUE PREVENTION

This page (`/application/new`) is responsible for creating new application drafts and redirecting users to the start page. **DO NOT MODIFY** the redirect logic without understanding the implications.

## What This Page Does

1. **Creates a new application draft** via POST to `/api/v1/applications`
2. **Stores application ID** in localStorage as `current_application_id`
3. **Stores draft token** in localStorage as `draft_token` 
4. **Redirects to** `/application/{id}/start` on success

## ❌ Common Issues That Break This Flow

### Issue: Page redirects to homepage (`/`)
**Cause**: The original code had silent fallback redirects to `/` on any error
**Fix Applied**: 
- Removed `router.push('/')` fallback redirects
- Added proper error states with user-friendly messages
- Added comprehensive console logging for debugging

### Issue: API endpoint not responding
**Symptoms**: Loading spinner shows forever, then error
**Check**: 
1. Rails server running on port 3001: `curl http://localhost:3001/up`
2. API endpoint working: `curl -X POST http://localhost:3001/api/v1/applications -H "Content-Type: application/json" -d '{"free_zone":"IFZA","formation_type":"new_company"}'`

### Issue: Silent failures
**Prevention**: All errors now show user-friendly error messages instead of redirecting

## 🔧 Debugging Steps

If `/application/new` is not working:

1. **Check Rails Server**:
   ```bash
   curl http://localhost:3001/up
   # Should return: <html><body style="background-color: green"></body></html>
   ```

2. **Test API Endpoint**:
   ```bash
   curl -X POST http://localhost:3001/api/v1/applications \
     -H "Content-Type: application/json" \
     -d '{"free_zone":"IFZA","formation_type":"new_company"}'
   # Should return: {"success":true,"application_id":"...","draft_token":"..."}
   ```

3. **Check Browser Console**:
   - Look for console logs starting with 🚀, 📡, 📄, ✅, or ❌
   - Check for network errors in Network tab

4. **Check localStorage**:
   - `current_application_id` should be set after successful creation
   - `draft_token` should be set if provided by API

## 🚨 DO NOT:

- Add `router.push('/')` fallback redirects
- Remove error logging or error states
- Modify redirect logic without testing
- Remove the comprehensive comments in the component

## ✅ Safe Changes:

- Update loading UI/UX
- Improve error messages
- Add additional logging
- Update API endpoint URL (if backend changes)
- Modify localStorage key names (if coordinated with other components)

## Related Files:

- `/application/{id}/start/page.tsx` - Where users are redirected after creation
- `ApplicationContext.tsx` - Manages application state
- `middleware.ts` - Allows `/application` routes as public
- Backend: `app/controllers/api/v1/applications_controller.rb#create`

