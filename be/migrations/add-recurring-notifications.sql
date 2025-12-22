-- Migration: Add recurring notification support with cron patterns
-- This adds fields for recurring notifications with cron-based scheduling

-- Add is_recurring flag
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT FALSE;

-- Add cron pattern for recurring schedule
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS cron_pattern VARCHAR(100) DEFAULT NULL;

-- Add timezone support
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC';

-- Add last execution tracking
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS last_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add next execution time (calculated field)
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS next_send_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add recurrence end date (optional)
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS recurrence_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add execution counter for recurring notifications
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS total_executions INTEGER NOT NULL DEFAULT 0;

-- Update status enum to include 'active' for recurring notifications
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_status_check;

ALTER TABLE notifications
ADD CONSTRAINT notifications_status_check 
CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed', 'active'));

-- Add comments for documentation
COMMENT ON COLUMN notifications.is_recurring IS 'Whether this notification is recurring based on cron pattern';
COMMENT ON COLUMN notifications.cron_pattern IS 'Cron pattern for recurring notifications (e.g., "0 9 * * 1" for every Monday at 9 AM)';
COMMENT ON COLUMN notifications.timezone IS 'Timezone for cron execution (e.g., "Asia/Ho_Chi_Minh", "UTC")';
COMMENT ON COLUMN notifications.last_sent_at IS 'Last execution time for recurring notifications';
COMMENT ON COLUMN notifications.next_send_at IS 'Next scheduled execution time for recurring notifications';
COMMENT ON COLUMN notifications.recurrence_end_date IS 'Optional end date for recurring notifications - stops after this date';
COMMENT ON COLUMN notifications.total_executions IS 'Number of times a recurring notification has been executed';

-- Create indexes for efficient cron job queries
CREATE INDEX IF NOT EXISTS idx_notifications_recurring 
ON notifications(is_recurring) 
WHERE is_recurring = TRUE;

CREATE INDEX IF NOT EXISTS idx_notifications_active_recurring 
ON notifications(status, is_recurring, next_send_at) 
WHERE status = 'active' AND is_recurring = TRUE;

CREATE INDEX IF NOT EXISTS idx_notifications_next_send 
ON notifications(next_send_at) 
WHERE next_send_at IS NOT NULL;

-- Verification and summary
DO $$
DECLARE
    v_column_count INTEGER;
BEGIN
    -- Count new columns
    SELECT COUNT(*) INTO v_column_count
    FROM information_schema.columns 
    WHERE table_name = 'notifications' 
      AND column_name IN ('is_recurring', 'cron_pattern', 'timezone', 'last_sent_at', 
                          'next_send_at', 'recurrence_end_date', 'total_executions');

    IF v_column_count = 7 THEN
        RAISE NOTICE '✅ All 7 recurring notification columns added successfully';
    ELSE
        RAISE NOTICE '⚠️  Only % of 7 columns found', v_column_count;
    END IF;

    -- Check status constraint
    IF EXISTS (
        SELECT 1
        FROM information_schema.check_constraints cc
        JOIN information_schema.constraint_column_usage ccu
          ON cc.constraint_name = ccu.constraint_name
        WHERE ccu.table_name = 'notifications'
          AND ccu.column_name = 'status'
          AND cc.check_clause LIKE '%active%'
    ) THEN
        RAISE NOTICE '✅ Status constraint updated with ''active'' status';
    ELSE
        RAISE NOTICE '❌ Status constraint not properly updated';
    END IF;

    -- Check indexes
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'notifications' 
          AND indexname = 'idx_notifications_recurring'
    ) THEN
        RAISE NOTICE '✅ Index idx_notifications_recurring created';
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'notifications' 
          AND indexname = 'idx_notifications_active_recurring'
    ) THEN
        RAISE NOTICE '✅ Index idx_notifications_active_recurring created';
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'notifications' 
          AND indexname = 'idx_notifications_next_send'
    ) THEN
        RAISE NOTICE '✅ Index idx_notifications_next_send created';
    END IF;
END $$;

-- Display column information
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'notifications'
  AND column_name IN ('is_recurring', 'cron_pattern', 'timezone', 'last_sent_at', 
                      'next_send_at', 'recurrence_end_date', 'total_executions', 
                      'status', 'scheduled_at')
ORDER BY ordinal_position;

-- Example queries for testing recurring notifications
-- Uncomment to test:

/*
-- Example 1: Create a daily notification at 9 AM
INSERT INTO notifications (
    _id, sender_type, system_user_id, title, body, scope, status,
    is_recurring, cron_pattern, timezone, next_send_at
) VALUES (
    gen_random_uuid(),
    'system_user',
    'YOUR_SYSTEM_USER_ID',
    'Daily Morning Notification',
    'Good morning! Check out today''s events.',
    'all',
    'active',
    TRUE,
    '0 9 * * *',
    'Asia/Ho_Chi_Minh',
    '2025-12-23 09:00:00+07'
);

-- Example 2: Create a weekly notification (every Monday at 10 AM)
INSERT INTO notifications (
    _id, sender_type, system_user_id, title, body, scope, status,
    is_recurring, cron_pattern, timezone, next_send_at
) VALUES (
    gen_random_uuid(),
    'system_user',
    'YOUR_SYSTEM_USER_ID',
    'Weekly Event Reminder',
    'Check out this week''s upcoming events!',
    'all',
    'active',
    TRUE,
    '0 10 * * 1',
    'Asia/Ho_Chi_Minh',
    '2025-12-23 10:00:00+07'
);

-- Query to find active recurring notifications due for execution
SELECT 
    _id,
    title,
    cron_pattern,
    timezone,
    last_sent_at,
    next_send_at,
    total_executions
FROM notifications
WHERE status = 'active'
  AND is_recurring = TRUE
  AND next_send_at <= NOW()
  AND (recurrence_end_date IS NULL OR recurrence_end_date > NOW())
ORDER BY next_send_at;
*/
