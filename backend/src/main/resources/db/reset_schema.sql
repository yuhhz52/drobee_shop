-- Chạy lệnh này TRƯỚC khi start backend lần đầu
-- Xóa toàn bộ schema cũ + Flyway history để reset sạch
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
