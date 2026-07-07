# VIXXY D'ORANCE — Hướng dẫn Deploy (100% miễn phí)

Website chính: `vixxy-store/`  
Backend API: `backend/`  
Admin Dashboard: `admin/`

## URL mẫu sau khi deploy

| Dịch vụ | URL |
|---------|-----|
| Frontend | `https://vixxy-dorance.vercel.app` |
| Backend API | `https://vixxy-dorance-api.onrender.com` |
| Admin | `https://vixxy-dorance-admin.vercel.app` |
| Database | Supabase PostgreSQL (Free) |

---

## Bước 1: Database — Supabase (Free)

1. Tạo project tại [supabase.com](https://supabase.com)
2. Vào **Project Settings → Database → Connection string → URI**
3. Copy chuỗi PostgreSQL, ví dụ:
   ```
   postgresql://postgres.[ref]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
4. Dùng làm `DATABASE_URL` cho backend

---

## Bước 2: Backend — Render (Free)

1. Push code lên GitHub
2. Tạo **Web Service** trên [render.com](https://render.com)
3. Chọn repo, **Root Directory**: `web(thoitrang)/backend` (hoặc `backend` nếu repo root là `web(thoitrang)`)
4. Render tự đọc `render.yaml` hoặc cấu hình thủ công:
   - **Build Command**: `npm install && npm run build:prod`
   - **Start Command**: `npm run start:prod`
5. Thêm Environment Variables:

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://...
FRONTEND_URL=https://vixxy-dorance.vercel.app
BACKEND_URL=https://vixxy-dorance-api.onrender.com
ADMIN_URL=https://vixxy-dorance-admin.vercel.app
CORS_ORIGINS=https://vixxy-dorance.vercel.app,https://vixxy-dorance-admin.vercel.app
JWT_SECRET=<random-64-chars>
JWT_REFRESH_SECRET=<random-64-chars>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
GEMINI_API_KEY=<optional>
CLOUDINARY_CLOUD_NAME=<optional>
CLOUDINARY_API_KEY=<optional>
CLOUDINARY_API_SECRET=<optional>
```

6. Deploy xong, mở `https://vixxy-dorance-api.onrender.com/health` — phải thấy JSON `{ "status": "ok" }`

> **Seed lần đầu**: Đặt `SEED_ON_START=true` trên Render để tự tạo tài khoản demo (`admin@vixxy.com/admin123`, `user@vixxy.com/user123`). Sau deploy thành công, đổi thành `false`.

> **Lưu ý Render Free**: service sleep sau 15 phút không dùng. Lần truy cập đầu có thể mất ~30–60 giây để wake up.

---

## Bước 3: Frontend — Vercel (Free)

1. Tạo project trên [vercel.com](https://vercel.com)
2. Import repo, **Root Directory**: `web(thoitrang)/vixxy-store`
3. Framework: **Next.js** (tự detect)
4. Thêm Environment Variables:

```env
NEXT_PUBLIC_BASE_URL=https://vixxy-dorance.vercel.app
NEXT_PUBLIC_API_URL=https://vixxy-dorance-api.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://vixxy-dorance-api.onrender.com
NEXT_PUBLIC_ADMIN_URL=https://vixxy-dorance-admin.vercel.app
```

5. Deploy → URL mặc định dạng `https://vixxy-dorance.vercel.app`

---

## Bước 4: Admin Dashboard — Vercel (Free)

1. Tạo project Vercel thứ 2 (hoặc monorepo project khác)
2. **Root Directory**: `web(thoitrang)/admin`
3. Framework: **Vite**
4. Environment Variables:

```env
VITE_API_URL=https://vixxy-dorance-api.onrender.com/api
VITE_SOCKET_URL=https://vixxy-dorance-api.onrender.com
VITE_STORE_URL=https://vixxy-dorance.vercel.app
```

---

## Bước 5: HTTPS & Domain

- **Vercel** và **Render** tự cấp HTTPS (Let's Encrypt)
- Custom domain (nếu có): thêm trong Vercel/Render Dashboard → DNS CNAME

---

## Bước 6: Kiểm tra Production Checklist

- [ ] Trang chủ load được trên mobile/tablet/desktop
- [ ] Đăng ký / Đăng nhập hoạt động
- [ ] Xem sản phẩm, giỏ hàng, checkout
- [ ] QR Payment Demo quét được → trang mock → thanh toán thành công
- [ ] Chat AI widget hoạt động
- [ ] Chat Realtime (Socket.IO) khách ↔ staff
- [ ] Admin Dashboard truy cập được
- [ ] API health: `GET /` backend trả JSON OK

---

## Chạy local (trước khi deploy)

```powershell
# Backend
cd web(thoitrang)/backend
Copy-Item .env.example .env
npm install
npm run dev

# Frontend (terminal mới)
cd web(thoitrang)/vixxy-store
Copy-Item .env.example .env.local
npm install
npm run dev

# Admin (terminal mới)
cd web(thoitrang)/admin
Copy-Item .env.example .env
npm install
npm run dev
```

---

## Chia sẻ link cho mọi người

Sau khi deploy xong, gửi link:

```
https://vixxy-dorance.vercel.app
```

Mọi người có thể truy cập, đăng ký, mua hàng, chat AI, thanh toán QR demo mà không cần cài đặt gì.

---

## Tài liệu Production

- [docs/PRODUCTION_GUIDE.md](docs/PRODUCTION_GUIDE.md) — Hướng dẫn production đầy đủ
- [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md) — Biến môi trường chi tiết
- [DEPLOY.md](DEPLOY.md) — Hướng dẫn deploy nhanh (Vercel + Render + Supabase)
