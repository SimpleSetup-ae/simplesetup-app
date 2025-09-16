# 🔐 Simple Setup - Authentication System

## Overview
Simple Setup uses **Devise** authentication with enhanced security features, replacing the previous Clerk integration. The system provides secure user authentication with Google and LinkedIn OAuth, comprehensive security features, and professional email notifications.

## 🚀 Quick Start

### Demo Accounts
Use these pre-configured accounts for testing:

| User Type | Email | Password | Description |
|-----------|--------|----------|-------------|
| **Client** | `client@simplesetup.ae` | `password123` | Individual entrepreneur |
| **Business** | `business@simplesetup.ae` | `password123` | SME business owner |
| **Corporate** | `corporate@simplesetup.ae` | `password123` | Large company client |
| **Admin** | `admin@simplesetup.ae` | `admin123456` | System administrator |
| **Support** | `support@simplesetup.ae` | `support123` | Customer support |
| **Accountant** | `accountant@simplesetup.ae` | `accounting123` | Financial services |

### Environment Setup
Required environment variables:
```env
# Devise Authentication
DEVISE_SECRET_KEY=f26a5b70201a181962fdb9d1ce886b37424fd8d757ad91d9e9fedefb8b8aec10739624dd12cc48119156949bbd83f2f811e9dc97ca14e67613d5ab5cca82416d

# SendGrid Email Service
SENDGRID_API_KEY=your-sendgrid-api-key

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
```

## 🔒 Security Features

### Account Protection
- **Account Locking**: Automatically locks accounts after 10 failed login attempts
- **Early Warning**: Sends security alert email after 6 failed attempts
- **Email Unlock**: Users receive unlock instructions via email
- **Session Security**: 24-hour session timeout for inactive users

### Email Notifications
- **Email Change Alerts**: Notifications sent to old email when address is changed
- **Password Change Confirmations**: Alerts when passwords are modified
- **Security Warnings**: Professional security alerts for suspicious activity
- **Account Unlock Instructions**: Clear steps to regain account access

### Time-Based Security
- **Email Confirmation**: 3-day window to confirm new email addresses
- **Password Reset**: 6-hour expiration for password reset tokens
- **Session Management**: Automatic logout after 24 hours of inactivity

## 🔑 Authentication Methods

### 1. Email/Password
Standard email and password authentication with:
- Minimum 6-character passwords
- bcrypt encryption with 12 stretches
- Email format validation
- Unique email enforcement

### 2. OAuth Providers
- **Google OAuth 2.0**: Sign in with Google accounts
- **LinkedIn OAuth 2.0**: Professional network integration
- **Automatic Account Creation**: New users created from OAuth
- **Token Storage**: Secure storage of OAuth tokens

## 📧 Email System

### SendGrid Integration
- **Professional Templates**: Branded email templates
- **Domain**: `simplesetup.ae`
- **Sender Addresses**:
  - General: `noreply@simplesetup.ae`
  - Security: `security@simplesetup.ae`

### Email Types
1. **Welcome Emails**: Account confirmation
2. **Security Alerts**: Failed login warnings
3. **Password Reset**: Secure reset instructions
4. **Account Changes**: Email/password change notifications
5. **Account Unlock**: Recovery instructions

## 🛡️ Security Implementation

### Database Security
- **Encrypted Passwords**: bcrypt with salt
- **Secure Tokens**: Cryptographically secure random tokens
- **Index Optimization**: Proper database indexes for performance
- **UUID Support**: Primary keys use UUIDs

### Session Management
- **Secure Cookies**: HTTP-only, secure cookies
- **CSRF Protection**: Cross-site request forgery protection
- **Session Timeout**: Automatic expiration
- **Remember Me**: Optional extended sessions

### Client Isolation
- **Company Access Control**: Users can only access their own companies
- **Role-Based Permissions**: Different access levels per company
- **Membership Validation**: Strict company membership checks

## 🔧 API Endpoints

### Authentication
```
POST /api/v1/auth/sign_in     # Email/password login
GET  /api/v1/auth/me          # Current user info
DELETE /api/v1/auth/sign_out  # Logout
```

### OAuth
```
GET /users/auth/google_oauth2      # Google OAuth
GET /users/auth/linkedin           # LinkedIn OAuth
GET /users/auth/:provider/callback # OAuth callbacks
```

### User Management
```
POST /users                   # User registration
GET  /users/password/new      # Password reset form
POST /users/password          # Password reset request
GET  /users/confirmation      # Email confirmation
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration with email confirmation
- [ ] Email/password login
- [ ] Password reset functionality
- [ ] Account locking (10 failed attempts)
- [ ] Warning email (6 failed attempts)
- [ ] Account unlock via email
- [ ] Email change notifications
- [ ] Password change notifications
- [ ] Google OAuth login
- [ ] LinkedIn OAuth login
- [ ] Session timeout (24 hours)
- [ ] Client data isolation

### Test Scripts
```bash
# Test SendGrid configuration
ruby test_sendgrid.rb

# Test Devise security settings
ruby test_devise_security.rb
```

## 🚀 Deployment

### Database Migration
```bash
bundle exec rake db:migrate
bundle exec rake db:seed
```

### Heroku Configuration
```bash
heroku config:set DEVISE_SECRET_KEY=your-key
heroku config:set SENDGRID_API_KEY=your-key
heroku config:set GOOGLE_CLIENT_ID=your-id
heroku config:set GOOGLE_CLIENT_SECRET=your-secret
heroku config:set LINKEDIN_CLIENT_ID=your-id
heroku config:set LINKEDIN_CLIENT_SECRET=your-secret
```

### Domain Configuration
- **Development**: `localhost:3000`
- **Production**: `simplesetup.ae`
- **Email Links**: Automatically use correct domain

## 📊 Monitoring

### Security Metrics
- Failed login attempts per user
- Account lockout frequency
- Password reset requests
- Email confirmation rates
- OAuth usage statistics

### Email Delivery
- SendGrid delivery statistics
- Bounce and spam rates
- Email open rates
- Click-through rates

## 🔄 Migration from Clerk

### Completed
- ✅ Removed all Clerk dependencies
- ✅ Implemented Devise authentication
- ✅ Added OAuth providers
- ✅ Configured SendGrid emails
- ✅ Enhanced security features
- ✅ Created demo accounts
- ✅ Updated frontend authentication

### Benefits
- **Cost Savings**: No Clerk subscription fees
- **Full Control**: Complete authentication customization
- **Enhanced Security**: Enterprise-level security features
- **Better Integration**: Native Rails authentication
- **Professional Emails**: Branded email communications

## 📞 Support

### Common Issues
1. **Database Connection**: Ensure Supabase is configured
2. **Email Delivery**: Verify SendGrid API key
3. **OAuth Setup**: Configure provider applications
4. **Session Issues**: Check cookie settings

### Documentation
- **Devise**: [https://github.com/heartcombo/devise](https://github.com/heartcombo/devise)
- **SendGrid**: [https://sendgrid.com/docs/](https://sendgrid.com/docs/)
- **OAuth Setup**: See provider documentation

---

**Simple Setup** - UAE Company Formation Platform  
*Secure, Professional, Reliable*
