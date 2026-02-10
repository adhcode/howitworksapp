# Artisan Directory System - Implementation Plan

## Overview
A directory system where facilitators can refer artisans (plumbers, electricians, carpenters, etc.) and admins can search and manage them.

## Features

### 1. Facilitator Features
- Unique referral link for each facilitator
- Copy referral link to share with artisans
- View artisans they've referred
- Track referral statistics

### 2. Artisan Registration (Public Form)
- Access via facilitator's referral link
- Form fields:
  - Full Name
  - Phone Number
  - Email (optional)
  - Address
  - State/City
  - Specialty/Trade (Plumber, Electrician, Carpenter, Painter, etc.)
  - Years of Experience
  - Referee Name
  - Referee Phone
  - Additional Skills (optional)
  - Availability (Full-time, Part-time, Weekends)

### 3. Admin Features
- Dedicated "Artisans" page in admin dashboard
- Search and filter by:
  - Location (State/City)
  - Specialty/Trade
  - Years of Experience
  - Referring Facilitator
  - Availability
- View artisan details
- Approve/Reject artisan applications
- Contact artisan directly
- See which facilitator referred them
- Export artisan list

## Database Schema

```sql
CREATE TABLE artisans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  specialty VARCHAR(100) NOT NULL, -- Plumber, Electrician, etc.
  years_of_experience INTEGER NOT NULL,
  referee_name VARCHAR(255) NOT NULL,
  referee_phone VARCHAR(20) NOT NULL,
  additional_skills TEXT,
  availability VARCHAR(50), -- Full-time, Part-time, Weekends
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  referred_by_facilitator_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_artisans_specialty ON artisans(specialty);
CREATE INDEX idx_artisans_city ON artisans(city);
CREATE INDEX idx_artisans_state ON artisans(state);
CREATE INDEX idx_artisans_status ON artisans(status);
CREATE INDEX idx_artisans_facilitator ON artisans(referred_by_facilitator_id);
```

## API Endpoints

### Backend (NestJS)

#### Public Endpoints
- `POST /api/artisans/register` - Register new artisan (public, no auth)
- `GET /api/artisans/facilitator/:facilitatorId/link` - Get facilitator referral link

#### Admin Endpoints
- `GET /api/admin/artisans` - List all artisans with filters
- `GET /api/admin/artisans/:id` - Get artisan details
- `PATCH /api/admin/artisans/:id/status` - Approve/Reject artisan
- `DELETE /api/admin/artisans/:id` - Delete artisan
- `GET /api/admin/artisans/export` - Export artisan list (CSV)

#### Facilitator Endpoints
- `GET /api/facilitators/artisans/my-referrals` - Get artisans referred by facilitator
- `GET /api/facilitators/artisans/referral-link` - Get my referral link
- `GET /api/facilitators/artisans/stats` - Get referral statistics

## Frontend Components

### Admin Dashboard
1. **Artisans Page** (`admin-dashboard/src/pages/Artisans.tsx`)
   - List view with filters
   - Search functionality
   - Status badges
   - Quick actions

2. **Artisan Details Modal** (`admin-dashboard/src/components/artisans/ArtisanDetailsModal.tsx`)
   - Full artisan information
   - Approve/Reject buttons
   - Contact information
   - Referring facilitator info

3. **Artisan Filters** (`admin-dashboard/src/components/artisans/ArtisanFilters.tsx`)
   - Location filters
   - Specialty filters
   - Experience range
   - Status filter

### Public Registration Form
1. **Artisan Registration Page** (`admin-dashboard/public/artisan-register.html`)
   - Standalone public page
   - Mobile-responsive form
   - Success confirmation

### Facilitator Dashboard Enhancement
1. **Referral Link Section** in Facilitator Details
   - Display unique link
   - Copy to clipboard button
   - QR code (optional)
   - Referral count

## Implementation Steps

### Phase 1: Database & Backend (Priority)
1. Create migration for artisans table
2. Create Artisan entity/schema
3. Create ArtisansModule, Service, Controller
4. Implement public registration endpoint
5. Implement admin CRUD endpoints
6. Implement facilitator referral endpoints

### Phase 2: Admin Dashboard
1. Create Artisans page with list view
2. Add filters and search
3. Create Artisan Details Modal
4. Add approve/reject functionality
5. Add to navigation menu

### Phase 3: Public Form
1. Create public registration form
2. Style with Tailwind CSS
3. Add form validation
4. Success/Error handling

### Phase 4: Facilitator Integration
1. Add referral link to Facilitator Details page
2. Show referred artisans count
3. Add "My Referrals" section

## Referral Link Format
```
https://admin.propertyhomecare.app/register-artisan?ref=FACILITATOR_ID
```

## Specialty Options
- Plumber
- Electrician
- Carpenter
- Painter
- Mason/Bricklayer
- Tiler
- Welder
- HVAC Technician
- Roofer
- Landscaper
- General Handyman
- Other (specify)

## Status Workflow
1. **Pending** - Just registered, awaiting admin review
2. **Approved** - Verified and available for hire
3. **Rejected** - Did not meet criteria
4. **Inactive** - Previously approved but no longer active

## Notifications
- Email to admin when new artisan registers
- Email to artisan when approved/rejected
- SMS to facilitator when their referral is approved (optional)

---

Ready to implement? Let's start with Phase 1!
