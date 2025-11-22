-- Migration: add is_active column to organizers
ALTER TABLE organizers
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
