-- Fix Flyway checksums for migrations V1 and V4
-- Run this in Supabase SQL Editor

-- Check current checksums
SELECT version, description, checksum FROM flyway_schema_history ORDER BY installed_rank;

-- Update checksum for V1 (use the 'resolved locally' checksum from error)
UPDATE flyway_schema_history 
SET checksum = 1638679457 
WHERE version = '1' AND description = 'create schema';

-- Update checksum for V4 (use the 'resolved locally' checksum from error)
UPDATE flyway_schema_history 
SET checksum = -1293949514 
WHERE version = '4';

-- Verify the update
SELECT version, description, checksum FROM flyway_schema_history ORDER BY installed_rank;
