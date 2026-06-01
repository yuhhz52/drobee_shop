# Drobee Shop - Tài liệu chức năng tổng thể

Tài liệu này tổng hợp toàn bộ chức năng hiện có của dự án, theo cả frontend và backend, để làm nền tảng tiếp tục phát triển.

## 1) Tổng quan hệ thống

- Frontend: React + Vite (UI shop + admin)
- Backend: Spring Boot (REST API, JWT, OAuth2 Google)
- DB: MySQL
- Cache/Blacklist token: Redis
- Thanh toán: VNPay, Stripe
- Lưu file: upload nội bộ tại `backend/uploads`
- Deploy/dev: Docker Compose

## 2) Kiến trúc & cấu trúc thư mục chính

### Frontend
- `frontend/src/app/router.jsx`: định nghĩa toàn bộ routes
- `frontend/src/features/`: chia theo tính năng (home, catalog, cart, checkout, auth, account, admin, payment, order)
- `frontend/src/services/`: gọi API theo domain
- `frontend/src/core/api/`: http client + endpoints + extractor
- `frontend/src/app/store/`: Redux store và slices

### Backend
- `backend/src/main/java/.../controller`: REST controllers
- `backend/src/main/resources/application.yaml`: cấu hình app
- `backend/src/main/resources/db/migration`: migration DB (Flyway)

## 3) Chức năng frontend (UI)

### 3.1. Các trang và routes chính

| Route | Trang | Mô tả |
|---|---|---|
| `/` | Home | Trang chủ, hiển thị sản phẩm nổi bật
| `/men` | ProductListPage | Danh sách theo danh mục Nam
| `/women` | ProductListPage | Danh sách theo danh mục Nữ
| `/accessories` | ProductListPage | Danh sách Phụ kiện
| `/new-arrivals` | ProductListPage | Sản phẩm mới
| `/products` | ProductListPage | Tất cả sản phẩm
| `/sale` | ProductListPage | Sản phẩm sale
| `/product/:productSlug` | ProductDetails | Chi tiết sản phẩm
| `/shops` | ShopPages | Trang shop/tổng quan cửa hàng
| `/cart-items` | Cart | Giỏ hàng
| `/checkout` | Checkout | Thanh toán
| `/orderConfirmed` | OrderConfirmed | Xác nhận đơn hàng
| `/account-details/*` | Account | Hồ sơ, đơn hàng, logout
| `/v1/login` | Login | Đăng nhập
| `/v1/register` | Register | Đăng ký
| `/oauth2/callback` | OAuth2LoginCallback | Nhận token sau đăng nhập Google
| `/payment/stripe-success` | StripeReturnHandler | Xử lý kết quả Stripe
| `/admin/*` | AdminPanel | Quản trị (React Admin)
| `/403` | Page403 | Trang 403

### 3.2. Nhóm chức năng khách hàng

- Duyệt danh mục/sản phẩm, tìm sản phẩm theo slug
- Xem chi tiết sản phẩm
- Quản lý giỏ hàng (thêm/xóa/cập nhật số lượng)
- Checkout theo địa chỉ giao hàng
- Thanh toán: COD / VNPay / Stripe
- Xác nhận đơn hàng
- Quản lý tài khoản: thông tin cá nhân, avatar, địa chỉ, lịch sử đơn

### 3.3. Authentication & Authorization

- Đăng ký, xác thực code
- Đăng nhập JWT
- Refresh token
- Logout (blacklist refresh token ở Redis)
- OAuth2 Google (callback redirect về frontend)

### 3.4. Admin (React Admin)

- Quản lý sản phẩm: list/create/edit/delete
- Quản lý danh mục: list/edit
- Quản lý người dùng: list/delete
- Quản lý đơn hàng: list
- Upload ảnh sản phẩm qua API `/api/file`

## 4) Các service frontend và mapping API

### 4.1. Auth
- `auth.service.js`
  - `POST /api/auth/login`
  - `POST /api/auth/register`
  - `POST /api/auth/verify`
  - `POST /api/auth/logout`
  - `POST /api/auth/refresh`

### 4.2. Product
- `product.service.js`
  - `GET /api/products?categoryId&typeIds&name&newArrival&page&size`
  - `GET /api/products?slug=...`

### 4.3. Category
- `category.service.js`
  - `GET /api/category`
  - `GET /api/category/{id}`

### 4.4. User & Address
- `user.service.js`
  - `GET /api/user/profile`
  - `POST /api/user/avatar` (multipart)
  - `DELETE /api/user/{id}` (admin)
  - `POST /api/address`
  - `DELETE /api/address/{id}`

### 4.5. Order & Payment
- `order.service.js`
  - `POST /api/order` (tạo đơn hàng + tạo session thanh toán)
  - `POST /api/order/update-payment` (Stripe confirm)
  - `GET /api/order/user` (đơn hàng theo user)

### 4.6. Upload
- `upload.service.js`
  - `POST /api/file` (upload file, admin)

## 5) Backend API (Controller tổng hợp)

### 5.1. AuthController (`/api/auth`)
- `POST /login` - đăng nhập
- `POST /register` - đăng ký
- `POST /verify` - xác thực mã
- `POST /refresh` - refresh token
- `POST /logout` - logout + blacklist refresh token

### 5.2. Oauth2Controller (`/oauth2`)
- `GET /success` - callback Google OAuth2, redirect về frontend với token

### 5.3. UsersController (`/api/user`)
- `GET /profile` - lấy profile user hiện tại
- `POST/PUT /avatar` - cập nhật avatar
- `GET /` - danh sách user (ADMIN)
- `DELETE /{id}` - xóa user (ADMIN)

### 5.4. ProductsController (`/api/products`)
- `GET /` - danh sách sản phẩm (filter theo categoryId, typeIds, name, slug, newArrival, paging)
- `GET /{id}` - chi tiết theo ID
- `POST /` - tạo sản phẩm (ADMIN)
- `PUT /{id}` - cập nhật (ADMIN)
- `DELETE /{id}` - xóa (ADMIN)

### 5.5. CategoryController (`/api/category`)
- `GET /` - danh sách danh mục
- `GET /{id}` - chi tiết danh mục
- `POST /` - tạo danh mục (ADMIN)
- `PUT /{id}` - cập nhật (ADMIN)
- `DELETE /{id}` - xóa (ADMIN)

### 5.6. AddressController (`/api/address`)
- `POST /` - thêm địa chỉ
- `DELETE /{id}` - xóa địa chỉ

### 5.7. OrderController (`/api/order`)
- `POST /` - tạo đơn
- `GET /user` - lấy đơn hàng của user
- `GET /` - danh sách đơn (admin, paging)
- `POST /update-payment` - cập nhật trạng thái thanh toán (Stripe)
- `GET /vnpay-return` - nhận callback VNPay và redirect về frontend

### 5.8. FileUpload (`/api/file`)
- `POST /` - upload file (ADMIN)

## 6) Cấu hình môi trường

Các biến môi trường được dùng trong `.env` (tham khảo `README.md` và `backend/src/main/resources/application.yaml`):

- `DB_USERNAME`, `DB_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `MAIL_USERNAME`, `MAIL_PASSWORD`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `JWT_SECRET`
- `STRIPE_SECRET`
- `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`
- `ORDER_CONFIRMED_URL` (tuỳ chọn)

## 7) Điểm cần chú ý / việc còn thiếu

- OAuth2 redirect URL và `returnUrl` VNPay đang cố định theo localhost, cần cấu hình khi deploy.
- `frontend/src/core/config/env.js` chỉ có `VITE_API_BASE_URL` nhưng chưa thấy `VITE_USE_MOCK_DATA` trong cấu hình runtime.

## 7.1) Đã hoàn thiện bổ sung (tháng 06/2026)

- API hủy đơn hàng đã được bổ sung và có test unit cho các trường hợp: thành công, đã hủy, không tồn tại, forbidden.
- UX thanh toán được cải thiện cho Stripe (retry, hiển thị lỗi) và VNPay (hiển thị lỗi theo query param).
- Logging cho luồng thanh toán Stripe/VNPay được thêm ở backend để dễ theo dõi.

## 8) File quan trọng để tiếp tục phát triển

- Frontend routes: `frontend/src/app/router.jsx`
- API endpoints: `frontend/src/core/api/endpoints.js`
- Auth flow: `frontend/src/services/auth.service.js`
- Checkout flow: `frontend/src/features/checkout/pages/Checkout/Checkout.jsx`
- Payment Stripe: `frontend/src/features/payment/pages/StripeReturnHandler/StripeReturnHandler.jsx`
- Admin panel: `frontend/src/features/admin/pages/AdminPanel/AdminPanel.jsx`
- Backend cấu hình: `backend/src/main/resources/application.yaml`
- Controllers backend: `backend/src/main/java/com/yuhecom/shopecom/**/controller`

---

Nếu bạn muốn, mình có thể bổ sung thêm:
- Sơ đồ luồng (sequence) cho đặt hàng + thanh toán
- Định nghĩa dữ liệu (DTO, entity) và quan hệ bảng
- Checklist kỹ thuật cho deploy/staging
