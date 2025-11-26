-- Create Admin User
-- Run this SQL script to create an admin account

-- First, check if admin already exists
SELECT id, email, role FROM users WHERE email = 'admin@howitworks.app';

-- If no admin exists, create one
-- Password: Admin@123 (hashed with bcrypt, 12 rounds)
-- IMPORTANT: Change this password after first login!

INSERT INTO users (
  email,
  password,
  first_name,
  last_name,
  role,
  phone_number,
  is_active,
  email_verified,
  created_at,
  updated_at
) VALUES (
  'admin@howitworks.app',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWU7u3oi', -- Password: Admin@123
  'Admin',
  'User',
  'admin',
  '+1234567890',
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING
RETURNING id, email, role;

-- Verify the admin was created
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  is_active,
  email_verified,
  created_at
FROM users 
WHERE email = 'admin@howitworks.app';

-- Login Credentials:
-- Email: admin@howitworks.app
-- Password: Admin@123
-- 
-- ⚠️  IMPORTANT: Change this password after first login!
