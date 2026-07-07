# Environment Variables Guide — VIXXY D'ORANCE

Tài liệu liệt kê toàn bộ biến môi trường cần thiết cho local và production.

---

## Backend (`backend/.env`)

| Biến | Bắt buộc | Mô tả | Ví dụ Local | Ví dụ Production |
|------|----------|-------|-------------|------------------|
| `NODE_ENV` | Có | Môi trường chạy | `development` | `production` |
| `PORT` | Có | Cổng API | `3003` | `10000` (Render) |
| `FRONTEND_URL` | Có (prod) | URL website chính | `http://localhost:3000` | `https://vixxy-dorance.vercel.app` |
| `BACKEND_URL` | Có (prod) | URL API công khai | `http://localhost:3003` | `https://vixxy-dorance-api.onrender.com` |
| `ADMIN_URL` | Có (prod) | URL admin dashboard | `http://localhost:3001` | `https://vixxy-dorance-admin.vercel.app` |
| `CORS_ORIGINS` | Có (prod) | Danh sách origin được phép, phân cách bằng dấu phẩy | `http://localhost:3000,http://localhost:3001` | `https://vixxy-dorance.vercel.app,https://vixxy-dorance-admin.vercel.app` |
| `DATABASE_URL` | Có (prod) | PostgreSQL connection string (Supabase) | _(để trống, dùng SQLite)_ | `postgresql://postgres.[ref]:[pass]@...supabase.com:6543/postgres?pgbouncer=true&sslmode=require` |
| `DB_STORAGE` | Local | Đường dẫn SQLite khi không có `DATABASE_URL` | `./database.sqlite` | _(không dùng)_ |
| `JWT_SECRET` | Có (prod) | Secret ký access token | `your_super_secret_jwt_key_here` | Chuỗi ngẫu nhiên 64+ ký tự |
| `JWT_REFRESH_SECRET` | Có (prod) | Secret ký refresh token | `your_super_secret_refresh_key_here` | Chuỗi ngẫu nhiên 64+ ký tự |
| `JWT_EXPIRES_IN` | Không | Thời hạn access token | `15m` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Không | Thời hạn refresh token | `7d` | `7d` |
| `SEED_ON_START` | Không | Tự seed dữ liệu demo lần đầu deploy | `false` | `true` (lần deploy đầu), sau đó `false` |
| `GEMINI_API_KEY` | Không | Google Gemini API (Chat AI nâng cao) | _(để trống)_ | API key từ Google AI Studio |
| `OPENROUTER_API_KEY` | Không | OpenRouter API (Chat AI thay thế) | _(để trống)_ | API key từ openrouter.ai |
| `CLOUDINARY_CLOUD_NAME` | Không | Cloudinary cloud name (upload ảnh) | _(để trống)_ | Từ Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | Không | Cloudinary API key | _(để trống)_ | Từ Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | Không | Cloudinary API secret | _(để trống)_ | Từ Cloudinary Dashboard |

### Tài khoản demo sau seed

```
admin@vixxy.com / admin123   (ADMIN)
user@vixxy.com  / user123    (CUSTOMER)
```

---

## Frontend Store (`vixxy-store/.env.local`)

| Biến | Bắt buộc | Mô tả | Ví dụ Local | Ví dụ Production |
|------|----------|-------|-------------|------------------|
| `NEXT_PUBLIC_BASE_URL` | Có | URL website | `http://127.0.0.1:3000` | `https://vixxy-dorance.vercel.app` |
| `NEXT_PUBLIC_API_URL` | Có | URL backend API (kèm `/api`) | `http://localhost:3003/api` | `https://vixxy-dorance-api.onrender.com/api` |
| `NEXT_PUBLIC_SOCKET_URL` | Có | URL Socket.IO server | `http://localhost:3003` | `https://vixxy-dorance-api.onrender.com` |
| `NEXT_PUBLIC_ADMIN_URL` | Không | URL admin dashboard | `http://localhost:3001` | `https://vixxy-dorance-admin.vercel.app` |
| `SEPAY_API_KEY` | Không | Sepay payment demo | _(để trống)_ | _(optional)_ |
| `SEPAY_MERCHANT_ID` | Không | Sepay merchant ID | _(để trống)_ | _(optional)_ |
| `SEPAY_WEBHOOK_SECRET` | Không | Sepay webhook secret | _(để trống)_ | _(optional)_ |

> **Lưu ý Vercel**: Tất cả biến `NEXT_PUBLIC_*` phải được khai báo trong Vercel Dashboard → Settings → Environment Variables trước khi deploy.

---

## Admin Dashboard (`admin/.env`)

| Biến | Bắt buộc | Mô tả | Ví dụ Local | Ví dụ Production |
|------|----------|-------|-------------|------------------|
| `VITE_API_URL` | Có | URL backend API (kèm `/api`) | `http://localhost:3003/api` | `https://vixxy-dorance-api.onrender.com/api` |
| `VITE_SOCKET_URL` | Có | URL Socket.IO server | `http://localhost:3003` | `https://vixxy-dorance-api.onrender.com` |
| `VITE_STORE_URL` | Không | URL website chính | `http://localhost:3000` | `https://vixxy-dorance.vercel.app` |

> **Lưu ý Vercel**: Biến `VITE_*` được embed lúc build. Sau khi thay đổi env trên Vercel, cần **Redeploy** admin project.

---

## Supabase — Lấy `DATABASE_URL`

1. Vào [supabase.com](https://supabase.com) → Project → **Settings → Database**
2. Chọn **Connection string → URI**
3. Dùng **Transaction pooler** (port 6543) cho Render:

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
```

4. Thay `[PASSWORD]` bằng mật khẩu database (Settings → Database → Database password)

---

## Cloudinary — Lấy credentials (optional)

1. Tạo tài khoản tại [cloudinary.com](https://cloudinary.com)
2. Dashboard → **Account Details** → copy:
   - Cloud Name → `CLOUDINARY_CLOUD_NAME`
   - API Key → `CLOUDINARY_API_KEY`
   - API Secret → `CLOUDINARY_API_SECRET`

---

## Gemini / OpenRouter — Chat AI (optional)

- **Gemini**: [aistudio.google.com](https://aistudio.google.com) → Get API Key → `GEMINI_API_KEY`
- **OpenRouter**: [openrouter.ai](https://openrouter.ai) → Keys → `OPENROUTER_API_KEY`

Nếu không cấu hình, Chat AI vẫn hoạt động với câu trả lời rule-based (FAQ, tìm sản phẩm cơ bản).

---

## Quick Setup (Local)

```powershell
# Backend
cd backend
Copy-Item .env.example .env
npm install

# Frontend
cd ../vixxy-store
Copy-Item .env.example .env.local
npm install

# Admin
cd ../admin
Copy-Item .env.example .env
npm install
```
