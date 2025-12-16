-- Migration: Add scheduled_at column and update status enum for scheduled notifications
-- Run this if you already have the notifications table created

-- Add scheduled_at column
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Update status check constraint to include 'scheduled'
-- First, drop the existing constraint
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_status_check;

-- Add new constraint with 'scheduled' status
ALTER TABLE notifications
ADD CONSTRAINT notifications_status_check 
CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed'));

-- Create index on scheduled_at for efficient cron job queries
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_at 
ON notifications(scheduled_at) 
WHERE status = 'scheduled';

-- Create index on status and scheduled_at combination
CREATE INDEX IF NOT EXISTS idx_notifications_status_scheduled 
ON notifications(status, scheduled_at) 
WHERE status = 'scheduled';

-- Verification queries
DO $$
BEGIN
    -- Check if scheduled_at column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'notifications' 
          AND column_name = 'scheduled_at'
    ) THEN
        RAISE NOTICE '✅ scheduled_at column added successfully';
    ELSE
        RAISE NOTICE '❌ scheduled_at column not found';
    END IF;

    -- Check if scheduled status is allowed
    IF EXISTS (
        SELECT 1
        FROM information_schema.check_constraints cc
        JOIN information_schema.constraint_column_usage ccu
          ON cc.constraint_name = ccu.constraint_name
        WHERE ccu.table_name = 'notifications'
          AND ccu.column_name = 'status'
          AND cc.check_clause LIKE '%scheduled%'
    ) THEN
        RAISE NOTICE '✅ Status constraint updated with ''scheduled'' value';
    ELSE
        RAISE NOTICE '❌ Status constraint not updated';
    END IF;

    -- Check indexes
    IF EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'notifications' 
          AND indexname = 'idx_notifications_scheduled_at'
    ) THEN
        RAISE NOTICE '✅ Index idx_notifications_scheduled_at created';
    ELSE
        RAISE NOTICE '❌ Index idx_notifications_scheduled_at not found';
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'notifications' 
          AND indexname = 'idx_notifications_status_scheduled'
    ) THEN
        RAISE NOTICE '✅ Index idx_notifications_status_scheduled created';
    ELSE
        RAISE NOTICE '❌ Index idx_notifications_status_scheduled not found';
    END IF;
END $$;

-- Summary
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications'
  AND column_name IN ('status', 'scheduled_at', 'sent_at')
ORDER BY ordinal_position;
