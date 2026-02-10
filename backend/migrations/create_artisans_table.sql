-- Create Artisans Table
-- This table stores artisan information referred by facilitators

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS artisans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  years_of_experience INTEGER NOT NULL,
  referee_name VARCHAR(255) NOT NULL,
  referee_phone VARCHAR(20) NOT NULL,
  additional_skills TEXT,
  availability VARCHAR(50) DEFAULT 'Full-time',
  status VARCHAR(20) DEFAULT 'pending',
  referred_by_facilitator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_artisans_specialty ON artisans(specialty);
CREATE INDEX IF NOT EXISTS idx_artisans_city ON artisans(city);
CREATE INDEX IF NOT EXISTS idx_artisans_state ON artisans(state);
CREATE INDEX IF NOT EXISTS idx_artisans_status ON artisans(status);
CREATE INDEX IF NOT EXISTS idx_artisans_facilitator ON artisans(referred_by_facilitator_id);
CREATE INDEX IF NOT EXISTS idx_artisans_created_at ON artisans(created_at DESC);

-- Add comments
COMMENT ON TABLE artisans IS 'Directory of artisans referred by facilitators';
COMMENT ON COLUMN artisans.status IS 'Status: pending, approved, rejected, inactive';
COMMENT ON COLUMN artisans.specialty IS 'Trade: Plumber, Electrician, Carpenter, etc.';
COMMENT ON COLUMN artisans.availability IS 'Availability: Full-time, Part-time, Weekends';
