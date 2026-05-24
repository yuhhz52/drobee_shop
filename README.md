# Drobee Fullstack E-Commerce Project

Drobee Fullstack E-Commerce Project là ứng dụng fullstack kết hợp React (frontend) và Spring Boot (backend), được Docker hóa để triển khai nhanh và nhất quán giữa các môi trường.

Demo video: https://drive.google.com/file/d/1Vx17PWB32tDK9qL2eNLBnSO5-jRn6_Kz/view?usp=drive_link

## Tính năng chính

- Duyệt và tìm kiếm sản phẩm
- Quản lý giỏ hàng, đơn hàng
- Thanh toán trực tuyến (VNPay, Stripe)
- Đăng nhập bằng Google
- Quản trị viên quản lý sản phẩm, đơn hàng, người dùng

## Công nghệ

### Backend (Spring Boot)

- Java 21+
- Spring Boot (Web, Security, Data JPA, Validation)
- Hibernate ORM
- Spring Security + JWT
- Maven

### Frontend (React)

- React 19 + Vite
- React Router DOM
- Axios
- TailwindCSS

### Cơ sở dữ liệu và Cache

- MySQL 8
- Redis 7

### DevOps

- Docker, Docker Compose

## Yêu cầu

- Docker Desktop và Docker Compose
- (Tuỳ chọn chạy local) JDK 21+, Node.js 20+, npm

## Chạy bằng Docker (khuyến nghị)

### 1) Clone dự án

```
git clone https://github.com/yuhhz52/drobee_shop.git
cd drobee_shop
```

### 2) Tạo file .env

Tạo file `.env` ở thư mục gốc với các biến tối thiểu (giá trị demo, hãy thay bằng thực tế khi triển khai):

```
DB_USERNAME=root
DB_PASSWORD=123456
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
MAIL_USERNAME=dummy@example.com
MAIL_PASSWORD=dummy
GOOGLE_CLIENT_ID=dummy
GOOGLE_CLIENT_SECRET=dummy
JWT_SECRET=changeit
STRIPE_SECRET=dummy
VNPAY_TMN_CODE=dummy
VNPAY_HASH_SECRET=dummy
```

### 3) Chạy toàn bộ services

```
docker compose up -d --build
```

Truy cập:
- Backend API: http://localhost:8080
- Frontend App: http://localhost:5175

### 4) Dừng toàn bộ services

```
docker compose down
```

## Chạy local (tuỳ chọn)

### Backend (Spring Boot)

1) Bật MySQL và Redis (có thể dùng Docker chỉ cho 2 service này):

```
docker compose up -d mysql redis
```

2) Nếu chạy backend local, cần chỉnh `spring.datasource.url` về `jdbc:mysql://localhost:3306/shopecom` hoặc tạo profile riêng.

3) Chạy backend:

```
cd backend
./mvnw.cmd spring-boot:run
```

### Frontend (Vite)

```
cd frontend
npm install
npm run dev
```

Frontend local: http://localhost:5175

## Cổng mặc định

- 8080: Backend API
- 5175: Frontend (Docker)
- 3306: MySQL
- 6379: Redis

## Troubleshooting nhanh

- Port bị chiếm (3306, 5175): dừng dịch vụ đang chạy hoặc đổi port trong `docker-compose.yml`.
- Thiếu `.env`: tạo file `.env` theo mục "Tạo file .env".

## Cấu trúc thư mục

```
drobee_shop/
|-- backend/        # Spring Boot API
|-- frontend/       # React frontend
|-- docker-compose.yml
|-- README.md
```
