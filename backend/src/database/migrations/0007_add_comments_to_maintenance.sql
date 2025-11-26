-- Add comments field to maintenance_requests table
ALTER TABLE maintenance_requests 
ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb;

-- Add unit_id field if it doesn't exist (for unit-specific maintenance)
ALTER TABLE maintenance_requests 
ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES units(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_property_id ON maintenance_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_assigned_to ON maintenance_requests(assigned_to);
