# Email Configuration for SimpleSetup

## 🚀 **ENABLED: SendGrid Email Sending for OTP Verification**

The application now supports **real email sending** via SendGrid for OTP verification emails during user registration and sign-in.

## 📧 **Current Configuration**

### Development Environment Options:

#### Option 1: **Log Only (Default)**
- Emails are logged to Rails console
- No actual emails sent
- Good for basic development

#### Option 2: **Gmail SMTP (Recommended for Testing)**
- Sends real emails via Gmail SMTP
- Perfect for testing the complete flow
- Requires Gmail App Password setup

#### Option 3: **SendGrid (Production-Ready)**
- Uses SendGrid API for email delivery
- Requires verified sender identity
- Best for production-like testing

## ⚙️ **Setup Instructions**

### For Real Email Testing (Option 2 - Gmail):

1. **Get Gmail App Password:**
   - Go to Google Account settings
   - Enable 2-Factor Authentication
   - Generate an App Password for "Mail"
   - Copy the 16-character password

2. **Add to .env file:**
   ```bash
   # Gmail SMTP for development email testing
   ENABLE_REAL_EMAILS=true
   GMAIL_USERNAME=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-16-char-app-password
   ```

3. **Restart Rails server:**
   ```bash
   cd backend && bundle exec rails server -p 3001
   ```

### For SendGrid (Option 3 - Production):

1. **Verify Sender Identity in SendGrid:**
   - Log into SendGrid dashboard
   - Go to Settings > Sender Authentication
   - Verify `noreply@simplesetup.ae` OR use your verified email
   - Update `SENDGRID_API_KEY` in .env if needed

2. **Update sender in production:**
   ```ruby
   # In app/mailers/application_mailer.rb
   # Make sure the 'from' address matches your verified SendGrid identity
   ```

## 🧪 **Testing Email Flow**

### Test User Registration with Email:

```bash
# Test the registration endpoint
curl -X POST http://localhost:3001/api/v1/inline_registrations \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User", 
    "email": "your-test-email@gmail.com",
    "password": "TestPass123",
    "password_confirmation": "TestPass123",
    "draft_token": "test-token"
  }'
```

### Check Rails Logs:
```bash
tail -f backend/log/development.log | grep -E "(✅|❌|📧|OTP)"
```

**Expected Success Log:**
```
✅ OTP email sent to your-test-email@gmail.com: 123456
```

**Expected Failure Log:**
```
❌ Failed to send OTP email: [error message]
📧 OTP for your-test-email@gmail.com: 123456 (email failed, check logs)
```

## 📱 **Frontend Integration**

The email flow is fully integrated with the frontend:

1. **User Registration** (`/application/{id}/signup`)
   - Creates account with email/password
   - Automatically sends OTP email
   - Redirects to email verification

2. **Email Verification** (`/application/{id}/verify-email`)
   - Shows OTP input form
   - User enters code from email
   - Verifies and continues flow

3. **Resend OTP** 
   - "Resend Code" button available
   - Rate limited (60 seconds)
   - Sends new OTP email

## 🔧 **Troubleshooting**

### Email Not Sending:

1. **Check Environment Variables:**
   ```bash
   echo $ENABLE_REAL_EMAILS
   echo $GMAIL_USERNAME  
   echo $GMAIL_APP_PASSWORD
   ```

2. **Check Rails Logs:**
   ```bash
   tail -f backend/log/development.log
   ```

3. **Test SMTP Connection:**
   ```bash
   # In Rails console
   cd backend && rails console
   ActionMailer::Base.smtp_settings
   ```

### Common Issues:

- **"Authentication failed"**: Check Gmail App Password
- **"Sender Identity not verified"**: Verify email in SendGrid dashboard
- **"Connection timeout"**: Check internet connection and SMTP settings
- **"Emails in spam"**: Normal for development, check spam folder

## 🚨 **Important Notes**

- **Development**: Emails sent to real addresses - use test emails only
- **Production**: Requires verified SendGrid sender identity
- **Rate Limiting**: OTP emails limited to 1 per minute per user
- **Security**: App passwords and API keys should never be committed to git

## ✅ **Verification Checklist**

- [ ] Environment variables configured
- [ ] Rails server restarted
- [ ] Test email sent successfully
- [ ] OTP received in inbox/spam
- [ ] Email verification flow works in frontend
- [ ] Resend functionality works
- [ ] Error handling works (invalid OTP, expired, etc.)

## 📞 **Need Help?**

If you're still having issues:
1. Check the Rails logs for specific error messages
2. Verify your Gmail App Password is correct
3. Test with a simple email first
4. Check spam folder for emails
5. Ensure Rails server was restarted after config changes

