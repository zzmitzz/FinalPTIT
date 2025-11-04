-- Migration: Add capacity column to events table
-- Date: 2025-10-28
-- Description: Adds capacity field to store event maximum attendee capacity
--              Sets default value of 300 for existing records

-- Add capacity column to events table with default value
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS capacity INTEGER NOT NULL DEFAULT 300;

-- Update existing records to have capacity of 300
UPDATE events 
SET capacity = 300 
WHERE capacity IS NULL OR capacity = 0;

-- Add check constraint to ensure capacity is positive
ALTER TABLE events
ADD CONSTRAINT check_capacity_positive CHECK (capacity > 0);

-- Add comment to the column
COMMENT ON COLUMN events.capacity IS 'Maximum number of attendees allowed for the event';

