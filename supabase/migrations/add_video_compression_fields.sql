-- Migration: Add video compression fields to 3d table
-- This migration adds fields needed for Rendi video compression integration

-- Add compression status enum type
DO $$ BEGIN
    CREATE TYPE compression_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to the 3d table
ALTER TABLE public."3d"
ADD COLUMN IF NOT EXISTS compression_status compression_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS compressed_path text,
ADD COLUMN IF NOT EXISTS rendi_command_id text,
ADD COLUMN IF NOT EXISTS compression_error text,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create an index on compression_status for faster queries
CREATE INDEX IF NOT EXISTS idx_3d_compression_status ON public."3d" (compression_status);

-- Create an index on rendi_command_id for webhook lookups
CREATE INDEX IF NOT EXISTS idx_3d_rendi_command_id ON public."3d" (rendi_command_id);

-- Add a comment to document the schema changes
COMMENT ON COLUMN public."3d".compression_status IS 'Status of video compression: pending, processing, completed, or failed';
COMMENT ON COLUMN public."3d".compressed_path IS 'Storage path to the compressed video file';
COMMENT ON COLUMN public."3d".rendi_command_id IS 'Unique ID from Rendi for tracking compression jobs';
COMMENT ON COLUMN public."3d".compression_error IS 'Error message if compression fails';
COMMENT ON COLUMN public."3d".updated_at IS 'Timestamp of last update to the record';