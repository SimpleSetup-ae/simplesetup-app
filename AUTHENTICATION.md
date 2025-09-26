# 🔐 Simple Setup - Authentication Architecture

## Overview

Simple Setup uses a **dual authentication system** that provides the optimal user experience for different user journeys:

1. **JWT Authentication** - For inline registration during the application flow
2. **Devise Session Authentication** - For all dashboard access (admin and client)

This architecture allows anonymous users to start applications without creating an account, while ensuring secure access to user dashboards and admin panels.

## 🏗️ Authentication Architecture

### Authentication Flow by User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                     Anonymous User Flow                          │
├─────────────────────────────────────────────────────────────────┤
│ 1. User visits /application/new                                  │
│ 2. Starts filling application (no auth required)                 │
│ 3. Application saved with draft_token in cookies                 │
│ 4. User creates account during application (inline registration) │
│ 5. JWT token generated for immediate access                      │
│ 6. Application linked to new user account                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Registered User Flow                          │
├─────────────────────────────────────────────────────────────────┤
│ 1. User visits /sign-in                                          │
│ 2. Authenticates with email/password                             │
│ 3. Devise session created                                        │
│ 4. Access to dashboard and all user features                     │
│ 5. Session persists across requests                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Admin User Flow                             │
├─────────────────────────────────────────────────────────────────┤
│ 1. Admin visits /sign-in                                         │
│ 2. Authenticates with email/password                             │
│ 3. Devise session created                                        │
│ 4. Access to admin panel (/admin/*)                              │
│ 5. Can view and manage all applications                          │
└─────────────────────────────────────────────────────────────────┘
```

## 🔑 Authentication Methods

### 1. JWT Authentication (Inline Registration Only)

**Purpose**: Provides immediate authentication after account creation during the application flow.

**When Used**:
- During inline registration (`/api/v1/inline_registrations`)
- After email verification in the application flow
- Temporary access to claim and submit applications

**Implementation**:
```ruby
# app/controllers/concerns/jwt_authenticatable.rb
module JwtAuthenticatable
  # Only authenticates via JWT for inline registration flow
  # All other authentication uses Devise sessions
end
```

**Token Structure**:
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "exp": 1234567890
}
```

### 2. Devise Session Authentication (Primary)

**Purpose**: Primary authentication method for all dashboard and admin access.

**When Used**:
- User sign-in (`/sign-in`)
- Dashboard access (`/dashboard`)
- Admin panel (`/admin/*`)
- All authenticated user actions

**Implementation**:
```ruby
# app/controllers/api/v1/auth_controller.rb
class Api::V1::AuthController < ApplicationController
  # Uses Devise session authentication exclusively
  # JWT is NOT used for sign-in/sign-out
  
  def login
    user = User.find_for_authentication(email: email)
    if user&.valid_password?(password)
      sign_in :user, user  # Creates Devise session
    end
  end
end
```

## 🚀 Quick Start

### Demo Accounts

| User Type | Email | Password | Description |
|-----------|--------|----------|-------------|
| **Admin** | `admin@simplesetup.ae` | `Password123!` | System administrator with full access |
| **Client** | `client@simplesetup.ae` | `Password123!` | Regular user account |

### Testing Authentication

#### 1. Test Admin Login
```bash
# Login as admin
curl -X POST http://localhost:3001/api/v1/auth/sign_in \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@simplesetup.ae", "password": "Password123!"}' \
  --cookie-jar cookies.txt

# Check authentication status
curl http://localhost:3001/api/v1/auth/me \
  --cookie cookies.txt

# Access admin endpoint
curl http://localhost:3001/api/v1/applications/admin \
  --cookie cookies.txt
```

#### 2. Test Anonymous Application Flow
```bash
# Start anonymous application
curl -X POST http://localhost:3001/api/v1/applications \
  -H "Content-Type: application/json" \
  -d '{"free_zone": "IFZA", "formation_type": "new_company"}'

# Continue without authentication using draft_token
```

## 🔒 Security Features

### Session Security
- **24-hour session timeout** for inactive users
- **Secure session cookies** with httponly and secure flags
- **Session reset** on login to prevent session fixation

### Admin Access Control
- **Role-based access** using `is_admin` flag
- **Separate authentication check** for admin endpoints
- **No hardcoded credentials** in production

### Password Security
- **Bcrypt encryption** with cost factor 12
- **Password complexity** requirements
- **Password change notifications** via email

## 📁 File Structure

```
backend/
├── app/
│   ├── controllers/
│   │   ├── api/v1/
│   │   │   ├── auth_controller.rb          # Devise session auth
│   │   │   ├── applications_controller.rb  # Mixed auth (anonymous/authenticated)
│   │   │   └── inline_registrations_controller.rb  # JWT for inline registration
│   │   └── concerns/
│   │       └── jwt_authenticatable.rb      # JWT authentication concern
│   └── models/
│       └── user.rb                         # User model with Devise
└── config/
    └── initializers/
        └── devise.rb                        # Devise configuration
```

## 🔧 Configuration

### Environment Variables
```env
# Devise Authentication
DEVISE_SECRET_KEY=your-secret-key-here

# Session Configuration
SECRET_KEY_BASE=your-secret-key-base

# Email Service (for password resets, etc.)
SENDGRID_API_KEY=your-sendgrid-api-key

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Routes Configuration
```ruby
# config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Devise session authentication
      post '/auth/sign_in', to: 'auth#login'
      delete '/auth/sign_out', to: 'auth#logout'
      get '/auth/me', to: 'auth#me'
      
      # JWT authentication (inline registration only)
      resources :inline_registrations do
        collection do
          post :verify_email
        end
      end
      
      # Admin routes (Devise session required)
      resources :applications do
        collection do
          get 'admin', to: 'applications#admin_index'
          get 'admin/:id', to: 'applications#admin_show'
          patch 'admin/:id', to: 'applications#admin_update'
        end
      end
    end
  end
end
```

## 🚨 Important Security Notes

1. **Never use hardcoded admin users** in production
2. **JWT tokens are only for inline registration** - not for general authentication
3. **All dashboard access requires Devise session** authentication
4. **Admin endpoints require both authentication and admin privileges**
5. **Session cookies must be httponly and secure** in production

## 🔄 Migration from Previous System

If migrating from a JWT-only or mixed authentication system:

1. Ensure all users have passwords set
2. Update frontend to use session cookies instead of JWT tokens for dashboard access
3. Keep JWT only for the inline registration flow
4. Test admin access thoroughly before deploying

## 📊 Authentication Decision Matrix

| Scenario | Authentication Method | Reason |
|----------|----------------------|---------|
| Anonymous user starting application | None | Better conversion, lower friction |
| User creating account mid-application | JWT | Immediate access without full login |
| User accessing dashboard | Devise Session | Secure, persistent authentication |
| Admin accessing admin panel | Devise Session | Maximum security for privileged access |
| API access from mobile app | JWT or API Key | Stateless authentication for APIs |
| Password reset flow | Devise Token | Secure token-based reset |

## 🐛 Troubleshooting

### Common Issues

1. **"Admin access required" error**
   - Ensure user has `is_admin: true` in database
   - Verify session cookie is being sent
   - Check that JWT authentication is not interfering

2. **Session not persisting**
   - Check session cookie configuration
   - Verify `SECRET_KEY_BASE` is set
   - Ensure cookies are enabled in browser

3. **JWT token expired during application**
   - Tokens are valid for 48 hours
   - User should complete registration promptly
   - Can implement token refresh if needed

## 📚 Further Reading

- [Devise Documentation](https://github.com/heartcombo/devise)
- [JWT Ruby Documentation](https://github.com/jwt/ruby-jwt)
- [Rails Security Guide](https://guides.rubyonrails.org/security.html)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)