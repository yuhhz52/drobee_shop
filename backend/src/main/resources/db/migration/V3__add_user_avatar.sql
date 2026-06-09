-- Add avatar_url column to ath_user if not exists (PostgreSQL version)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ath_user' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE ath_user ADD COLUMN avatar_url VARCHAR(255) NULL;
    END IF;
END $$;
