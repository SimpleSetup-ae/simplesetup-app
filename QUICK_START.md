# 🚀 Quick Start - Testing Devise Authentication

## ✅ **Setup Complete**

### Database & Authentication
- ✅ **Migrations Applied**: Devise fields added to users table
- ✅ **Demo User Created**: `demo@simplesetup.ae` / `password123`
- ✅ **SendGrid Configured**: Email notifications ready
- ✅ **Security Features**: Account locking, warnings, 24-hour sessions

### Environment Configuration
- ✅ **Environment Variables**: Loaded from `.env` file
- ✅ **Devise Secret**: Generated and configured
- ✅ **Database Connection**: PostgreSQL connected successfully

## 🎯 **Demo Account for Testing**

```
Email: demo@simplesetup.ae
Password: password123
```

## 🔧 **Manual Server Startup**

Since the automatic startup had some issues, here's how to start manually:

### 1. **Activate Environment** (Required)
```bash
source ./activate-env.sh
```

### 2. **Start Backend (Rails)**
```bash
cd backend
bundle exec rails server -p 3001
```

### 3. **Start Frontend (Next.js)** (New Terminal)
```bash
cd frontend
npm run dev
```

## 🌐 **Access Points**

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Sign In Page**: http://localhost:3000/sign-in
- **Sign Up Page**: http://localhost:3000/sign-up

## 🧪 **Test the Login Process**

1. **Open Browser**: Go to http://localhost:3000
2. **Navigate to Sign In**: Click sign-in or go to `/sign-in`
3. **Use Demo Account**:
   - Email: `demo@simplesetup.ae`
   - Password: `password123`
4. **Test Features**:
   - Email/password login
   - Session management (24-hour timeout)
   - Account security features

## 🔒 **Security Features to Test**

### Account Locking
- Try 6 failed login attempts → Warning email sent
- Try 10 failed login attempts → Account locked
- Check email for unlock instructions

### Email Notifications
- Change password → Confirmation email
- Change email → Notification to old email
- Security alerts for suspicious activity

### Session Management
- Sessions expire after 24 hours
- Secure cookie-based authentication
- Automatic logout on timeout

## 🛠️ **Troubleshooting**

### If Rails Server Won't Start
```bash
cd backend
source ../activate-env.sh
bundle install
bundle exec rails server -p 3001
```

### If Frontend Won't Start
```bash
cd frontend
npm install
npm run dev
```

### If Database Issues
```bash
cd backend
bundle exec rake db:migrate
ruby ../create_demo_user.rb
```

## 📧 **Email Testing**

With SendGrid configured, you can test:
- Password reset emails
- Account confirmation emails
- Security alert emails
- Account unlock emails

## 🎉 **Success Indicators**

- ✅ Frontend loads at localhost:3000
- ✅ Backend responds at localhost:3001
- ✅ Sign-in page displays correctly
- ✅ Demo user can log in successfully
- ✅ Session persists across page refreshes
- ✅ Security features work as expected

---

**Next Steps**: Once both servers are running, you can fully test the Devise authentication system with all the enhanced security features we implemented!

*Simple Setup - UAE Company Formation Platform*
