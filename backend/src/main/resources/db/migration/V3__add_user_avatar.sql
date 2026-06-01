SET @avatar_col_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'ath_user'
      AND COLUMN_NAME = 'avatar_url'
);

SET @add_avatar_sql := IF(
    @avatar_col_exists = 0,
    'ALTER TABLE ath_user ADD COLUMN avatar_url VARCHAR(255) NULL',
    'SELECT 1'
);

PREPARE add_avatar_stmt FROM @add_avatar_sql;
EXECUTE add_avatar_stmt;
DEALLOCATE PREPARE add_avatar_stmt;
