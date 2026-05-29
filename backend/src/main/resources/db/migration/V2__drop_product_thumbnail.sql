-- Drop legacy thumbnail column if it exists

SET @thumbnail_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'products'
      AND COLUMN_NAME = 'thumbnail'
);

SET @drop_thumbnail_sql := IF(
    @thumbnail_exists > 0,
    'ALTER TABLE products DROP COLUMN thumbnail',
    'SELECT 1'
);

PREPARE drop_thumbnail_stmt FROM @drop_thumbnail_sql;
EXECUTE drop_thumbnail_stmt;
DEALLOCATE PREPARE drop_thumbnail_stmt;

