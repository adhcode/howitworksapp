-- =====================================================
-- Expo Push Notifications - Database Schema
-- =====================================================
-- Run this migration to create notification tables
-- Date: December 2, 2025
-- =====================================================

-- Create push_tokens table
-- Stores Expo push tokens for each user's device
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  device_type VARCHAR(50), -- 'ios' or 'android'
  device_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP
);

-- Create indexes for push_tokens
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON push_tokens(token);
CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON push_tokens(is_active) WHERE is_active = true;

-- Add comments
COMMENT ON TABLE push_tokens IS 'Stores Expo push notification tokens for user devices';
COMMENT ON COLUMN push_tokens.user_id IS 'Reference to the user who owns this device';
COMMENT ON COLUMN push_tokens.token IS 'Expo push token (ExponentPushToken[...])';
COMMENT ON COLUMN push_tokens.device_type IS 'Device platform: ios or android';
COMMENT ON COLUMN push_tokens.device_name IS 'Human-readable device name';
COMMENT ON COLUMN push_tokens.is_active IS 'Whether this token is still valid';
COMMENT ON COLUMN push_tokens.last_used_at IS 'Last time this token was used to send a notification';

-- =====================================================

-- Create notifications table
-- Stores notification history for users
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  data JSONB, -- Additional data for navigation and context
  type VARCHAR(50), -- 'payment', 'maintenance', 'message', etc.
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  push_sent BOOLEAN DEFAULT false,
  push_sent_at TIMESTAMP
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Add comments
COMMENT ON TABLE notifications IS 'Stores notification history for all users';
COMMENT ON COLUMN notifications.user_id IS 'Reference to the user who received this notification';
COMMENT ON COLUMN notifications.title IS 'Notification title';
COMMENT ON COLUMN notifications.body IS 'Notification body text';
COMMENT ON COLUMN notifications.data IS 'JSON data for navigation and additional context';
COMMENT ON COLUMN notifications.type IS 'Notification type: payment, maintenance, message, etc.';
COMMENT ON COLUMN notifications.is_read IS 'Whether the user has read this notification';
COMMENT ON COLUMN notifications.sent_at IS 'When the notification was created';
COMMENT ON COLUMN notifications.read_at IS 'When the user marked it as read';
COMMENT ON COLUMN notifications.push_sent IS 'Whether push notification was sent successfully';
COMMENT ON COLUMN notifications.push_sent_at IS 'When the push notification was sent';

-- =====================================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for push_tokens
DROP TRIGGER IF EXISTS update_push_tokens_updated_at ON push_tokens;
CREATE TRIGGER update_push_tokens_updated_at
    BEFORE UPDATE ON push_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================

-- Sample queries for testing

-- Get all active tokens for a user
-- SELECT * FROM push_tokens WHERE user_id = 'user-id' AND is_active = true;

-- Get unread notifications for a user
-- SELECT * FROM notifications WHERE user_id = 'user-id' AND is_read = false ORDER BY sent_at DESC;

-- Get notification count by type
-- SELECT type, COUNT(*) FROM notifications GROUP BY type;

-- Get users with most notifications
-- SELECT user_id, COUNT(*) as notification_count FROM notifications GROUP BY user_id ORDER BY notification_count DESC LIMIT 10;

-- =====================================================

-- Verify tables were created
SELECT 
    'push_tokens' as table_name,
    COUNT(*) as row_count
FROM push_tokens
UNION ALL
SELECT 
    'notifications' as table_name,
    COUNT(*) as row_count
FROM notifications;

-- =====================================================
-- Migration complete!
-- =====================================================
