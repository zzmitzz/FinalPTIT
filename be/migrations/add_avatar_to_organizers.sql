-- Migration: Add avatar column to organizers table
-- Date: 2025-10-26
-- Description: Adds avatar field to store organizer profile pictures

-- Add avatar column to organizers table
ALTER TABLE organizers 
ADD COLUMN IF NOT EXISTS avatar VARCHAR(255);

-- Add comment to the column
COMMENT ON COLUMN organizers.avatar IS 'Path to organizer avatar image file';

