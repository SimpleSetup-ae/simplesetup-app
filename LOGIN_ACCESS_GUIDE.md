# 🔐 Login Access Guide - Admin & User Dashboards

## 🚀 **Quick Access Summary**

### **Admin Access:**
- **URL**: `http://localhost:3000/sign-in`
- **Email**: `admin@simplesetup.ae`  
- **Password**: `admin123456`
- **Dashboard**: Automatically redirects to admin dashboard

### **User/Submitter Access:**
- **URL**: `http://localhost:3000/sign-in`
- **Email**: Use the email from your submitted application
- **Password**: The password you set during registration
- **Dashboard**: User dashboard with their applications

## 📊 **Admin Dashboard Features**

### **View Submitted Applications:**
1. **Login as admin** → `http://localhost:3000/sign-in`
2. **Admin Dashboard** → Shows all submitted applications
3. **Applications Tab** → List of all company formation applications
4. **Click "View"** → See detailed application with all submitted data

### **Admin Capabilities:**
- ✅ **View all applications** from all users
- ✅ **Application details** with complete form data
- ✅ **User management** (create, edit, delete users)
- ✅ **Company management** (view, approve, reject)
- ✅ **Document access** (passports, supporting docs)
- ✅ **Status updates** (submitted → under_review → approved)

## 👤 **User Dashboard Features**

### **View Your Applications:**
1. **Login with your email** → The email you used during application
2. **User Dashboard** → Shows your submitted applications
3. **Application Status** → Track progress and updates
4. **Edit Applications** → Modify before final submission

### **User Capabilities:**
- ✅ **View own applications** only
- ✅ **Track application status** (draft → submitted → approved)
- ✅ **Edit draft applications** before submission
- ✅ **Upload additional documents** if requested
- ✅ **Communication** with admin team

## 🔑 **Available Demo Accounts**

### **Admin Accounts:**
```
Email: admin@simplesetup.ae
Password: admin123456
Role: Super Admin (full access)
```

### **Demo User Accounts:**
```
Email: client@simplesetup.ae
Password: password123
Role: Individual Client

Email: business@simplesetup.ae  
Password: password123
Role: Business Owner

Email: corporate@simplesetup.ae
Password: password123
Role: Corporate Client

Email: support@simplesetup.ae
Password: support123
Role: Support User

Email: accountant@simplesetup.ae
Password: accounting123
Role: Accountant
```

## 🎯 **Step-by-Step Access Instructions**

### **To Access Admin Dashboard:**

1. **Navigate to**: `http://localhost:3000/sign-in`
2. **Enter Credentials**:
   - Email: `admin@simplesetup.ae`
   - Password: `admin123456`
3. **Click "Sign In"**
4. **Automatic Redirect** → Admin Dashboard
5. **View Applications** → Click "Applications" tab
6. **Find Your Submission** → Search by email or company name
7. **View Details** → Click "View" button on the application

### **To Access User Dashboard (Your Submission):**

1. **Navigate to**: `http://localhost:3000/sign-in`
2. **Enter Your Credentials**:
   - Email: The email you used during application submission
   - Password: The password you set during registration
3. **Click "Sign In"**
4. **User Dashboard** → Shows your applications
5. **View Application** → Click on your submitted application
6. **Track Status** → See current progress and any admin updates

## 🛠️ **If You Need to Create Demo Data:**

### **Run Database Seeds:**
```bash
cd backend
bundle exec rails db:seed
```

### **This Creates:**
- ✅ Demo admin account
- ✅ Demo user accounts  
- ✅ Sample applications
- ✅ Test companies
- ✅ Business activities data

## 🔍 **Troubleshooting Login Issues**

### **If Admin Login Fails:**
1. **Check Rails server** is running: `curl http://localhost:3001/up`
2. **Verify admin user exists**: Check database or run seeds
3. **Check browser console** for authentication errors
4. **Try password reset** if needed

### **If User Login Fails:**
1. **Verify email** used during application submission
2. **Check password** set during registration process
3. **Look for OTP verification** if email wasn't confirmed
4. **Check Rails logs** for authentication errors

## 📱 **Dashboard URLs**

### **Direct Access URLs:**
- **Admin Dashboard**: `http://localhost:3000/dashboard` (after admin login)
- **User Dashboard**: `http://localhost:3000/dashboard` (after user login)
- **Applications List**: `http://localhost:3000/admin/applications` (admin only)
- **Users Management**: `http://localhost:3000/admin/users` (admin only)

### **Application Views:**
- **Admin View**: Complete application details with approval controls
- **User View**: Application status, progress tracking, document uploads

## ✅ **Ready to Access:**

1. **Admin Access**: Use `admin@simplesetup.ae` / `admin123456` to see all applications
2. **User Access**: Use your registration email/password to see your specific application
3. **Both dashboards** will show the submitted application data with all the passport details, company information, and documents you uploaded

The admin dashboard provides full oversight of all submitted applications, while the user dashboard shows personalized application tracking! 🎉

