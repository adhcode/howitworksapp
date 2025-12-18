# Admin & Facilitator Workflow Guide

## 🎯 Best Practices & Account Management

---

## 📋 Table of Contents
1. [User Roles Overview](#user-roles-overview)
2. [Admin Account Creation](#admin-account-creation)
3. [Facilitator Account Creation](#facilitator-account-creation)
4. [Login Experience](#login-experience)
5. [Workflow Best Practices](#workflow-best-practices)

---

## 👥 User Roles Overview

### Admin
**Purpose:** Platform owner/manager with full control

**Capabilities:**
- ✅ Create and manage facilitators
- ✅ View all properties across the platform
- ✅ Assign facilitators to properties
- ✅ View all landlords
- ✅ Monitor all maintenance requests
- ✅ Access analytics and reports
- ✅ System configuration

**Dashboard Access:** Full admin dashboard with all features

### Facilitator
**Purpose:** Property maintenance coordinator

**Capabilities:**
- ✅ View assigned properties only
- ✅ Manage maintenance requests for their properties
- ✅ Communicate with landlords and tenants
- ✅ Update maintenance status
- ✅ View property details and tenants
- ❌ Cannot create other facilitators
- ❌ Cannot see unassigned properties
- ❌ Cannot access system settings

**Dashboard Access:** Limited dashboard showing only assigned properties

---

## 🔐 Admin Account Creation

### Method 1: Database Script (Recommended for First Admin)

**Use Case:** Creating the very first admin account

```bash
cd backend
npm run create:admin
```

This will prompt you for:
- First Name
- Last Name
- Email
- Phone Number
- Password

**Or use the quick setup script:**

```bash
cd backend
npm run setup:quick
```

This creates:
- 1 Admin account
- 1 Facilitator account (for testing)
- Sample data

### Method 2: Direct Database Insert

```sql
INSERT INTO users (
  first_name,
  last_name,
  email,
  password,
  phone_number,
  role,
  is_active,
  is_email_verified
) VALUES (
  'Admin',
  'User',
  'admin@howitworks.app',
  '$2a$10$hashedPasswordHere', -- Use bcrypt to hash
  '+1234567890',
  'admin',
  true,
  true
);
```

**To hash a password:**

```bash
cd backend
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YourPassword123', 10));"
```

### Method 3: API Endpoint (If Setup Endpoint Exists)

```bash
curl -X POST http://localhost:3003/setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@howitworks.app",
    "password": "SecurePassword123",
    "phoneNumber": "+1234567890"
  }'
```

---

## 👷 Facilitator Account Creation

### Best Practice: Admin Creates Facilitators

**Workflow:**
1. Admin logs into dashboard
2. Goes to "Facilitators" page
3. Clicks "Add Facilitator" button
4. Fills in facilitator details:
   - First Name
   - Last Name
   - Email (this becomes their login)
   - Phone Number
   - Next of Kin details (optional)
5. System generates temporary password
6. Facilitator receives email with credentials
7. Facilitator logs in and changes password

### Via Admin Dashboard

**Step-by-Step:**

1. **Login as Admin**
   ```
   URL: http://localhost:5173/login
   Email: admin@howitworks.app
   Password: YourAdminPassword
   ```

2. **Navigate to Facilitators**
   ```
   Dashboard → Facilitators → Add Facilitator
   ```

3. **Fill Form:**
   - First Name: John
   - Last Name: Doe
   - Email: john.facilitator@howitworks.app
   - Phone: +1234567890
   - Next of Kin Name: Jane Doe
   - Next of Kin Phone: +0987654321
   - Next of Kin Relationship: Spouse

4. **System Actions:**
   - Creates facilitator account
   - Generates temporary password
   - Sends welcome email
   - Shows success message

5. **Facilitator Receives:**
   - Email with login credentials
   - Link to admin dashboard
   - Instructions to change password

---

## 🖥️ Login Experience

### What Facilitators See

**Same Login Page as Admin:**
- Same URL: `http://localhost:5173/login`
- Same login form
- Same branding and logo
- No visual difference

**Why?**
- Simpler to maintain one login page
- Professional appearance
- Role is determined after login
- Dashboard adapts based on role

**After Login:**
- Facilitators see limited dashboard
- Only their assigned properties
- No "Facilitators" menu item
- No "Landlords" menu item
- No system settings access

### Login Flow

```
┌─────────────────────────────────────┐
│  User enters email & password       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Backend validates credentials      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Check user role                    │
└──────────────┬──────────────────────┘
               │
       ┌───────┴───────┐
       │               │
       ▼               ▼
   ┌──────┐       ┌──────────┐
   │Admin │       │Facilitator│
   └──┬───┘       └────┬─────┘
      │                │
      ▼                ▼
┌──────────┐    ┌──────────────┐
│Full      │    │Limited       │
│Dashboard │    │Dashboard     │
└──────────┘    └──────────────┘
```

---

## 📊 Dashboard Differences

### Admin Dashboard

**Navigation Menu:**
- Dashboard (with full analytics)
- Facilitators (manage facilitators)
- Properties (all properties)
- Maintenance (all requests)
- Landlords (all landlords)
- Settings (system config)

**Dashboard Stats:**
- Total Properties
- Total Landlords
- Total Facilitators
- Total Units
- Occupied Units
- Maintenance Requests

**Charts:**
- Revenue trends
- Maintenance volume
- Property assignments
- Occupancy rates

### Facilitator Dashboard

**Navigation Menu:**
- Dashboard (personal stats)
- Properties (assigned only)
- Maintenance (assigned properties only)
- Settings (personal settings)

**Dashboard Stats:**
- Assigned Properties
- Total Tenants
- Total Units
- Maintenance Requests (for their properties)

**No Charts:**
- Simpler, task-focused view
- Quick actions for daily work

---

## 🔄 Workflow Best Practices

### 1. Initial Setup

```
Step 1: Create Admin Account
  ↓
Step 2: Admin Logs In
  ↓
Step 3: Admin Creates Facilitators
  ↓
Step 4: Admin Assigns Properties to Facilitators
  ↓
Step 5: Facilitators Log In and Start Work
```

### 2. Facilitator Onboarding

**Admin Checklist:**
- [ ] Create facilitator account
- [ ] Verify email is correct
- [ ] Assign initial properties
- [ ] Send welcome email with credentials
- [ ] Schedule onboarding call

**Facilitator Checklist:**
- [ ] Receive credentials email
- [ ] Log in to dashboard
- [ ] Change temporary password
- [ ] Review assigned properties
- [ ] Check maintenance requests
- [ ] Update profile information

### 3. Property Assignment

**Best Practice:**
- Assign properties based on location
- Balance workload across facilitators
- Consider facilitator expertise
- Review assignments monthly

**How to Assign:**
1. Admin → Properties page
2. Find unassigned property
3. Click "Assign Facilitator"
4. Select facilitator from dropdown
5. Confirm assignment
6. Facilitator sees property immediately

### 4. Daily Operations

**Admin Daily Tasks:**
- Review new maintenance requests
- Monitor facilitator performance
- Check property assignments
- Review analytics
- Handle escalations

**Facilitator Daily Tasks:**
- Check new maintenance requests
- Update request statuses
- Communicate with landlords/tenants
- Schedule property inspections
- Report issues to admin

---

## 🔒 Security Best Practices

### Password Requirements

**Enforce:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### Account Security

**Admin Accounts:**
- Use strong, unique passwords
- Enable 2FA (if implemented)
- Limit number of admin accounts
- Regular password changes
- Monitor login activity

**Facilitator Accounts:**
- Force password change on first login
- Regular password updates
- Deactivate when facilitator leaves
- Review access permissions

---

## 📧 Email Notifications

### Facilitator Welcome Email

**Subject:** Welcome to HowItWorks - Your Facilitator Account

**Content:**
```
Hi [First Name],

Welcome to HowItWorks! An admin has created an account for you.

Your Login Credentials:
Email: [email]
Temporary Password: [password]

Login URL: https://admin.howitworks.app/login

Important: Please change your password after first login.

Your Role: Facilitator
You can manage maintenance requests and properties assigned to you.

Need help? Contact: admin@howitworks.app

Best regards,
HowItWorks Team
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Facilitator Can't See Properties

**Cause:** No properties assigned yet

**Solution:**
1. Admin logs in
2. Goes to Properties page
3. Assigns properties to facilitator
4. Facilitator refreshes dashboard

### Issue 2: Facilitator Sees Admin Menu

**Cause:** Role not set correctly in database

**Solution:**
```sql
UPDATE users 
SET role = 'facilitator' 
WHERE email = 'facilitator@example.com';
```

### Issue 3: Can't Create Admin Account

**Cause:** No setup script or endpoint

**Solution:** Use database script or SQL insert

### Issue 4: Forgot Admin Password

**Solution:**
```bash
# Reset via database
cd backend
node -e "
const bcrypt = require('bcryptjs');
const newPassword = 'NewPassword123';
const hash = bcrypt.hashSync(newPassword, 10);
console.log('UPDATE users SET password = \\'' + hash + '\\' WHERE email = \\'admin@howitworks.app\\';');
"
```

---

## 📝 Quick Reference

### Create First Admin
```bash
cd backend
npm run create:admin
```

### Create Facilitator (via Dashboard)
```
Admin Dashboard → Facilitators → Add Facilitator
```

### Assign Property to Facilitator
```
Admin Dashboard → Properties → Select Property → Assign Facilitator
```

### Login URLs
```
Admin: http://localhost:5173/login
Facilitator: http://localhost:5173/login (same URL)
```

### Default Credentials (if using quick-setup)
```
Admin:
  Email: admin@howitworks.app
  Password: Admin123!

Facilitator:
  Email: facilitator@howitworks.app
  Password: Facilitator123!
```

---

## ✅ Summary

**Key Points:**
1. ✅ Admin creates facilitators (not self-signup)
2. ✅ Same login page for both roles
3. ✅ Dashboard adapts based on role
4. ✅ Facilitators see only assigned properties
5. ✅ Admin has full platform access
6. ✅ Use database scripts for first admin
7. ✅ Use dashboard UI for facilitators

**This workflow ensures:**
- Proper access control
- Easy onboarding
- Clear role separation
- Secure account management
- Professional user experience

---

**Need Help?**
- Check `backend/SETUP_ACCOUNTS.md` for scripts
- Run `npm run setup:quick` for test accounts
- Contact system administrator for access issues
