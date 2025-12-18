-- Fix notifications table schema to match the code expectations

-- Rename 'message' column to 'body'
ALTER TABLE notifications 
RENAME COLUMN message TO body;

-- Add missing columns
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP NOT NULL DEFAULT NOW();

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS push_sent BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS push_sent_at TIMESTAMP;

-- Update sent_at from created_at for existing records
UPDATE notifications 
SET sent_at = created_at 
WHERE sent_at IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

SELECT 'Notifications schema fixed successfully!' as status;
