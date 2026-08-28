# VolunteerConnect - Nền Tảng Kết Nối Tình Nguyện & Tác Động Xã Hội

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Container-Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**VolunteerConnect** là nền tảng web ứng dụng phục vụ kết nối trực tiếp giữa **Tình nguyện viên**, **Ban tổ chức hoạt động thiện nguyện** và **Quản trị viên hệ thống**. Nền tảng số hóa toàn bộ quy trình: từ khởi tạo chiến dịch, xét duyệt đơn, điểm danh, cấp chứng nhận, tương tác mạng xã hội cho đến báo cáo thống kê tác động cộng đồng theo thời gian thực.

> **Lưu ý bảo mật:** Mọi cấu hình nhạy cảm (JWT Secret, Database URI, Cloudinary API Key, v.v.) chỉ được nạp qua biến môi trường hoặc Secret Manager; tuyệt đối không commit file `.env` chứa secret vào Git.

---

## Mục lục

- [Nghiệp vụ và phạm vi](#nghiệp-vụ-và-phạm-vi)
- [Tính năng chính](#tính-năng-chính)
- [Kiến trúc kỹ thuật](#kiến-trúc-kỹ-thuật)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Yêu cầu môi trường](#yêu-cầu-môi-trường)
- [Hướng dẫn chạy Local](#hướng-dẫn-chạy-local)
- [Cấu hình biến môi trường](#cấu-hình-biến-môi-trường)
- [Tài liệu & Kiểm thử API](#tài-liệu--kiểm-thử-api)
- [Triển khai Cloud & CI/CD](#triển-khai-cloud--cicd)
- [Bảo mật và vận hành](#bảo-mật-và-vận-hành)
- [Đóng góp dự án](#đóng-góp-dự-án)
- [Bản quyền & Tác giả](#bản-quyền--tác-giả)

---

## Nghiệp vụ và phạm vi

```text
Tình nguyện viên (Volunteer)
  ├── Tìm kiếm, lọc chiến dịch theo tỉnh thành, lĩnh vực (Môi trường, Giáo dục, Y tế...)
  ├── Nộp đơn đăng ký tham gia, theo dõi trạng thái phê duyệt & lý do từ chối
  ├── Quản lý hồ sơ cá nhân, nhật ký hoạt động, kỹ năng và thành tích
  ├── Đăng bài viết, chia sẻ hình ảnh/video, bình luận và tương tác bảng tin (Feed)
  └── Gửi đơn đăng ký nâng cấp tài khoản lên Nhà tổ chức (Organizer)

Nhà tổ chức (Organizer)
  ├── Khởi tạo và quản lý các chiến dịch tình nguyện (chỉ tiêu TNV, thời gian, địa điểm, yêu cầu)
  ├── Phê duyệt hoặc từ chối đơn đăng ký tình nguyện viên kèm lý do phản hồi
  ├── Điểm danh người tham gia (Completed / Absent) và cấp xác nhận hoàn thành
  └── Theo dõi thống kê ứng viên, hiệu suất chiến dịch theo thời gian thực

Quản trị viên (Admin)
  ├── Tổng quan hệ thống (Overview metrics, chỉ số hoạt động toàn hệ thống)
  ├── Kiểm duyệt yêu cầu nâng cấp tài khoản Organizer (Đơn lẻ & Hàng loạt)
  ├── Kiểm duyệt nội dung hoạt động thiện nguyện trước khi mở đăng ký công khai
  ├── Quản lý tài khoản người dùng: phân quyền, tìm kiếm, khóa/mở khóa tài khoản
  ├── Thống kê phân bổ chiến dịch, tiến độ hoàn thành và lượt TNV được cấp chứng nhận
  └── Nhật ký kiểm duyệt (Audit Logs) phục vụ tra cứu và kiểm toán
```

---

## Tính năng chính

### 1. Xác thực & Phân quyền (Auth & RBAC)
- Đăng ký tài khoản, đăng nhập với JWT Bearer Tokens (Access Token + Refresh Token).
- Xác thực số điện thoại / Email qua mã OTP 6 chữ số.
- Luồng quên mật khẩu và đặt lại mật khẩu bảo mật qua OTP.
- Phân quyền nghiêm ngặt 3 vai trò: `Volunteer`, `Organizer`, `Admin`.

### 2. Quản lý Hoạt động Tình nguyện (Activities)
- Tìm kiếm thông minh theo từ khóa, lọc theo danh mục lĩnh vực và địa bàn hành chính (63 tỉnh thành & quận/huyện).
- Chi tiết chiến dịch: thời gian diễn ra, địa điểm chi tiết, chỉ tiêu TNV, yêu cầu kỹ năng, hình ảnh minh họa.
- Nộp đơn đăng ký tham gia chỉ với 1 click; tự động đóng đăng ký khi đã đủ chỉ tiêu.

### 3. Đăng ký & Điểm danh (Registrations & Attendance)
- Quản lý danh sách ứng viên theo từng chiến dịch.
- Phê duyệt/từ chối đơn đăng ký (hỗ trợ thao tác đơn lẻ và phê duyệt hàng loạt).
- Bảng điểm danh thời gian thực, cập nhật kết quả tham gia và xác nhận hoàn thành.

### 4. Mạng xã hội & Tương tác Cộng đồng (Community Posts)
- Bảng tin (Feed) chia sẻ câu chuyện, hình ảnh, video hoạt động thực tế.
- Tải lên đa phương tiện (Media upload qua Cloudinary/Storage).
- Tương tác: Thích (Like), Bình luận (Comment phân tầng), Chia sẻ (Share) bài viết.

### 5. Quản trị viên Tập trung (Admin Portal - 6 Sub-tabs)
- **Overview:** Chỉ số tổng quan, danh sách chờ duyệt nhanh.
- **Organizer Approvals:** Kiểm duyệt hồ sơ nâng cấp tư cách tổ chức.
- **Activity Approvals:** Kiểm duyệt bài đăng chiến dịch thiện nguyện mới.
- **User Management:** Quản lý thành viên, tìm kiếm nâng cao, khóa/mở khóa tài khoản vi phạm.
- **System Statistics:** Phân bổ tình trạng hoạt động (Open, Pending, Completed) và tổng lượt tham gia.
- **Audit History:** Lịch sử chi tiết toàn bộ các quyết định duyệt/từ chối của Admin.

---

## Kiến trúc kỹ thuật

### Tổng thể hệ thống

```text
[ Browser / Mobile Client ]
           │  HTTPS / RESTful API
           ▼
[ Vite + React Frontend ] ── (Feature-Based Modular Architecture)
           │
           │  HTTP Requests (Axios Client with Bearer Token & Refresh Queue)
           ▼
[ FastAPI Backend (Port 8000) ]
   ├── Authentication Middleware (JWT & OAuth2)
   ├── Routers: /auth, /activities, /registrations, /posts, /organizer, /admin
   ├── Service Layer & Business Logic
   └── DAL (Data Access Layer) / Async Motor Engine
           │
           ├──► [ MongoDB Replica Set ] (ACID Multi-document Transactions)
           └──► [ Cloudinary / CDN ] (Media & Video Streaming)
```

### Kiến trúc Frontend (Feature-Based Architecture)

Frontend được tái cấu trúc theo mô hình phân tầng tính năng khép kín, triệt tiêu hoàn toàn các file nguyên khối:
- **`core/`**: Chứa Domain types, Data formatters, Axios clients và Interceptor xử lý tự động refresh token khi nhận HTTP 401.
- **`shared/`**: Các thành phần UI tái sử dụng độc lập (Avatar, Pagination, Dialogs, Toast, StatusBadge, Layout).
- **`features/*/`**: Mỗi tính năng gom trọn vẹn `api/`, `components/`, `views/` và export qua `index.ts`.
- **`routes/`**: Hash router phân quyền Role Guards bảo vệ an toàn các route nhạy cảm (`#/admin/dashboard`, `#/organizer/dashboard`).

---

## Công nghệ sử dụng

| Tầng | Công nghệ | Phiên bản / Chi tiết |
| :--- | :--- | :--- |
| **Frontend Core** | React, TypeScript, Vite | React 18, TypeScript 5.0+, Vite 5 |
| **Styling & UI** | Tailwind CSS, Google Fonts | Inter, Material Symbols Outlined |
| **State & Router** | React Context API, Hash Routing | AppContext, AppRouter, Axios Interceptors |
| **Backend Core** | Python, FastAPI | Python 3.11+, FastAPI, Starlette |
| **Data Validation** | Pydantic v2 | Schema validation & Request serialization |
| **Database** | MongoDB, Motor | Async MongoDB Driver, BSON Validators |
| **Authentication** | Passlib (bcrypt), PyJWT | JWT Access (15m) + Refresh Token (7d) |
| **Media Storage** | Cloudinary SDK / Local Storage | Upload hình ảnh, video hoạt động |
| **Container & CI/CD** | Docker, Docker Compose, GitHub Actions | Multi-stage Dockerfile, Automated build pipeline |

---

## Cấu trúc dự án

```text
VolunteerConnect/
├── .github/
│   └── workflows/                 # CI/CD pipeline tự động build và test
├── backend/                       # FastAPI Backend Application
│   ├── app/
│   │   ├── api/                   # API Endpoints & Routers (/auth, /activities, /posts...)
│   │   ├── core/                  # Security, JWT, Database connections, Config
│   │   ├── models/                # Pydantic Schemas & BSON Document Models
│   │   ├── services/              # Business Logic Services
│   │   └── main.py                # FastAPI Application Entrypoint
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                      # React + TypeScript Frontend Application
│   ├── src/
│   │   ├── config/                # Constants, Cấu hình địa giới hành chính (63 tỉnh thành)
│   │   ├── core/                  # Domain Types, Utility Formatters, Axios API Client
│   │   ├── shared/                # Layout (Navbar, Footer) & Reusable UI Components
│   │   ├── features/              # Feature Modules (auth, activities, posts, organizer, admin...)
│   │   │   ├── auth/              # Đăng ký, Đăng nhập, Quên mật khẩu, OTP
│   │   │   ├── activities/        # Danh sách & Chi tiết hoạt động
│   │   │   ├── registrations/     # Đơn tham gia của tình nguyện viên
│   │   │   ├── posts/             # Bảng tin, Bình luận, Tương tác bài viết
│   │   │   ├── profile/           # Hồ sơ cá nhân, Đổi mật khẩu
│   │   │   ├── organizer/         # Bảng điều khiển Tổ chức, Điểm danh
│   │   │   ├── admin/             # Bảng điều khiển Quản trị viên (6 Tabs)
│   │   │   └── about/             # Giới thiệu đội ngũ, Marquee
│   │   ├── routes/                # AppRouter quản lý định tuyến và Role Guards
│   │   ├── context/               # Global AppContext & Toast/Dialog Providers
│   │   └── App.tsx                # Clean Root Component
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
├── Docs/                          # Tài liệu đặc tả kỹ thuật, BRD, API Specs & ERD
├── docker-compose.yml             # Khởi chạy toàn bộ hạ tầng (Backend + Frontend + MongoDB)
└── README.md                      # Tài liệu tổng quan dự án
```

---

## Yêu cầu môi trường

### Phát triển Local
- **Node.js**: Phiên bản `18.x` hoặc `20.x LTS` & `npm` / `pnpm`.
- **Python**: Phiên bản `3.11+` & `pip`.
- **MongoDB**: MongoDB Community Server 6.0+ (hoặc MongoDB Atlas / Docker container).
- **Docker & Docker Compose** (nếu chạy container hóa).

---

## Hướng dẫn chạy Local

### Cách 1: Chạy trực tiếp từng phần (Khuyến nghị khi phát triển)

#### 1. Khởi động Backend (FastAPI)
```bash
cd backend

# Tạo và kích hoạt môi trường ảo
python -m venv venv
# Trên Windows:
.\venv\Scripts\activate
# Trên Linux/macOS:
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt

# Tạo file .env từ mẫu và cấu hình
cp .env.example .env

# Khởi chạy server Uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Backend API sẽ hoạt động tại: `http://localhost:8000`  
Tài liệu tương tác Swagger UI: `http://localhost:8000/docs`

#### 2. Khởi động Frontend (React + Vite)
Mở một terminal mới:
```bash
cd frontend

# Cài đặt thư viện
npm install

# Tạo file .env từ mẫu
cp .env.example .env

# Chạy máy chủ phát triển
npm run dev
```
Giao diện ứng dụng sẽ chạy tại: `http://localhost:5173` (hoặc `http://localhost:3000`).

---

### Cách 2: Chạy toàn bộ hệ thống bằng Docker Compose

```bash
# Tại thư mục gốc của dự án
docker compose up --build -d
```
Docker sẽ tự động build và chạy cả 3 dịch vụ:
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:8000`
- **MongoDB:** `localhost:27017`

---

## Cấu hình biến môi trường

### Backend (`backend/.env`)
```ini
# Server Configuration
PROJECT_NAME="VolunteerConnect API"
ENVIRONMENT=development
PORT=8000

# Database
MONGODB_URL=mongodb://localhost:27017/volunteer_connect
DATABASE_NAME=volunteer_connect

# JWT Security
SECRET_KEY=your-super-secret-jwt-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Cloudinary Storage (Tùy chọn cho upload ảnh/video)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (`frontend/.env`)
```ini
# Base API URL trỏ tới FastAPI Backend
VITE_API_URL=http://localhost:8000
```

---

## Tài liệu & Kiểm thử API

Sau khi Backend khởi động, truy cập các đường dẫn sau để xem tài liệu API chi tiết:
- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI Schema JSON:** [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

### Kiểm tra Build Frontend
```bash
cd frontend
npm run build
```
Kết quả kiểm thử đảm bảo: `✓ built in ~1.6s`, **0 lỗi TypeScript**.

---

## Triển khai Cloud & CI/CD

Hệ thống được thiết kế sẵn sàng cho triển khai đa nền tảng:
1. **Google Cloud Run / Render / AWS ECS**: Sử dụng Dockerfile đa tầng (Multi-stage build) để tối ưu kích thước image.
2. **MongoDB Atlas**: Cụm cơ sở dữ liệu phân tán có sẵn cơ chế replica set và backup tự động.
3. **CI/CD Pipeline**: Tự động kích hoạt kiểm tra cú pháp, build container và triển khai khi merge code vào nhánh `main`.

---

## Bảo mật và vận hành

- **Quản lý phiên (Session Management):** Cơ chế Token Refresh Queue tự động gia hạn phiên đăng nhập không làm gián đoạn trải nghiệm người dùng; xóa token khỏi `localStorage` khi đăng xuất.
- **Xác thực dữ liệu đầu vào:** Toàn bộ payload đầu vào được kiểm duyệt chặt chẽ bởi Pydantic Schema ở backend và TypeScript types ở frontend.
- **Bảo mật cơ sở dữ liệu:** Không lưu trữ mật khẩu thuần túy (Mật khẩu được mã hóa bằng thuật toán `bcrypt` với muối ngẫu nhiên).
- **CORS Policy:** Chỉ cho phép domain frontend hợp lệ gửi request tới API.
- **Không commit Secrets:** `.gitignore` được cấu hình nghiêm ngặt để loại trừ tất cả các tệp `.env`, `.pem`, `.key` và thư mục `node_modules`, `dist`.

---

## Đóng góp dự án

1. Fork dự án hoặc tạo nhánh tính năng mới từ `main` (`git checkout -b feature/amazing-feature`).
2. Tuân thủ quy ước commit theo chuẩn [Conventional Commits](https://www.conventionalcommits.org/) (ví dụ: `feat:`, `fix:`, `refactor:`, `docs:`).
3. Đảm bảo chạy `npm run build` không phát sinh lỗi trước khi tạo Pull Request.
4. Mở Pull Request vào nhánh `main` và mô tả chi tiết các thay đổi.

---

## Bản quyền & Tác giả

- **Tác giả:** Nguyễn Thanh Thiệt & Đội ngũ thực hiện dự án VolunteerConnect.
- **Mục đích:** Dự án nghiên cứu, học tập và triển khai thực tế giải pháp chuyển đổi số cho các hoạt động thiện nguyện cộng đồng.
- **Bản quyền:** © 2026 VolunteerConnect. Mọi quyền được bảo lưu.
