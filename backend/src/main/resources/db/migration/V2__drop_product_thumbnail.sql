-- Drop legacy thumbnail column if it exists (PostgreSQL version)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'thumbnail'
    ) THEN
        ALTER TABLE products DROP COLUMN IF EXISTS thumbnail;
    END IF;
END $$;
