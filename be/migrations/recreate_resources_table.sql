-- Migration: Recreate resources table with proper ENUM type
-- Date: 2025-10-28
-- Description: Drops and recreates the resources table with correct schema

-- Drop the table if it exists
DROP TABLE IF EXISTS resources CASCADE;

-- Drop the enum type if it exists
DROP TYPE IF EXISTS enum_resources_resource_type CASCADE;

-- Create the ENUM type
CREATE TYPE enum_resources_resource_type AS ENUM ('MAPS', 'FILE');

-- Create the resources table
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    session_id INTEGER,
    event_id UUID,
    resource_type enum_resources_resource_type NOT NULL,
    name VARCHAR(255) NOT NULL,
    url_source VARCHAR(255) NOT NULL,
    description TEXT,
    file_size_bytes BIGINT,
    mime_type VARCHAR(255),
    is_public BOOLEAN NOT NULL DEFAULT true,
    download_count INTEGER NOT NULL DEFAULT 0,
    upload_date TIMESTAMP NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    tags VARCHAR(255)[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_session FOREIGN KEY (session_id) REFERENCES sessions(id),
    CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES events(_id),
    
    -- Check constraint: must belong to either session or event, not both
    CONSTRAINT check_session_or_event CHECK (
        (session_id IS NULL AND event_id IS NOT NULL) OR 
        (session_id IS NOT NULL AND event_id IS NULL)
    )
);

-- Add comments
COMMENT ON TABLE resources IS 'Resources associated with events or sessions';
COMMENT ON COLUMN resources.session_id IS 'Can be null if resource belongs to event';
COMMENT ON COLUMN resources.event_id IS 'Can be null if resource belongs to session';
COMMENT ON COLUMN resources.resource_type IS 'Type: MAPS or FILE';
COMMENT ON COLUMN resources.file_size_bytes IS 'File size in bytes for uploaded files';
COMMENT ON COLUMN resources.mime_type IS 'MIME type of the resource (e.g., application/pdf, image/jpeg)';
COMMENT ON COLUMN resources.is_public IS 'Whether the resource is publicly accessible';
COMMENT ON COLUMN resources.download_count IS 'Number of times the resource has been downloaded';
COMMENT ON COLUMN resources.upload_date IS 'When the resource was uploaded';
COMMENT ON COLUMN resources.is_active IS 'Whether the resource is currently active and accessible';
COMMENT ON COLUMN resources.tags IS 'Tags for categorizing and searching resources';

