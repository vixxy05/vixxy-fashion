# Production Guide — VIXXY D'ORANCE

Hướng dẫn đưa website lên production với stack miễn phí 100%.

## Kiến trúc Production

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Vercel (Free)  │     │  Render (Free)  │     │ Supabase (Free) │
│  vixxy-store    │────▶│  backend API    │────▶│  PostgreSQL     │
│  (Next.js)      │     │  + Socket.IO    │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
┌─────────────────┐              │
│  Vercel (Free)  │──────────────┘
│  admin (Vite)   │
└─────────────────┘
```

| Thành phần | Nền tảng | URL mẫu |
|------------|----------|---------|
| Website chính | Vercel | `https://vixxy-dorance.vercel.app` |
| Admin Dashboard | Vercel | `https://vixxy-dorance-admin.vercel.app` |
| Backend API + Socket.IO | Render | `https://vixxy-dorance-api.onrender.com` |
| Database | Supabase | _(internal connection string)_ |
| File Storage | Cloudinary | _(optional)_ |

---

## Checklist trước khi deploy

- [ ] Code đã push lên GitHub (public hoặc private với quyền truy cập cho Vercel/Render)
- [ ] Không commit file `.env` (đã có trong `.gitignore`)
- [ ] Build local thành công:
  ```powershell
  cd vixxy-store && npm run build
  cd ../admin && npm run build
  cd ../backend && npm run build:prod
  ```

---

## Bước 1: Supabase Database

1. Tạo project tại [supabase.com](https://supabase.com) (region gần Singapore)
2. Lấy `DATABASE_URL` (pooler, port 6543) — xem [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)
3. Không cần chạy migration thủ công — backend tự `prisma db push` + `sequelize.sync()` khi khởi động

---

## Bước 2: Render Backend

1. [render.com](https://render.com) → **New → Web Service**
2. Connect GitHub repo
3. **Root Directory**: `web(thoitrang)/backend` _(điều chỉnh theo cấu trúc repo của bạn)_
4. Render tự đọc `render.yaml` hoặc cấu hình:
   - **Build Command**: `npm install && npm run build:prod`
   - **Start Command**: `npm run start:prod`
5. Thêm Environment Variables (xem [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md))
6. **Quan trọng lần deploy đầu**: đặt `SEED_ON_START=true` để tạo tài khoản demo
7. Sau deploy thành công, đổi `SEED_ON_START=false` để tránh seed lại

### Kiểm tra backend

```bash
curl https://vixxy-dorance-api.onrender.com/health
# {"status":"ok","uptime":...,"timestamp":"..."}

curl https://vixxy-dorance-api.onrender.com/
# {"message":"VIXXY D'ORANCE API Server","status":"ok",...}
```

> **Render Free tier**: Service sleep sau ~15 phút không có traffic. Lần truy cập đầu có thể mất 30–60 giây để wake up.

---

## Bước 3: Vercel Frontend (vixxy-store)

1. [vercel.com](https://vercel.com) → **Add New Project**
2. Import repo, **Root Directory**: `web(thoitrang)/vixxy-store`
3. Framework: **Next.js** (auto-detect)
4. Thêm Environment Variables:

```env
NEXT_PUBLIC_BASE_URL=https://vixxy-dorance.vercel.app
NEXT_PUBLIC_API_URL=https://vixxy-dorance-api.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://vixxy-dorance-api.onrender.com
NEXT_PUBLIC_ADMIN_URL=https://vixxy-dorance-admin.vercel.app
```

5. Deploy → URL dạng `https://vixxy-dorance.vercel.app`

File `vercel.json` đã cấu hình security headers sẵn.

---

## Bước 4: Vercel Admin Dashboard

1. Tạo project Vercel thứ 2
2. **Root Directory**: `web(thoitrang)/admin`
3. Framework: **Vite**
4. Environment Variables:

```env
VITE_API_URL=https://vixxy-dorance-api.onrender.com/api
VITE_SOCKET_URL=https://vixxy-dorance-api.onrender.com
VITE_STORE_URL=https://vixxy-dorance.vercel.app
```

5. Deploy → URL dạng `https://vixxy-dorance-admin.vercel.app`

---

## Bước 5: Cập nhật CORS trên Render

Sau khi có URL thật từ Vercel, cập nhật trên Render:

```env
FRONTEND_URL=https://<your-store>.vercel.app
ADMIN_URL=https://<your-admin>.vercel.app
BACKEND_URL=https://<your-api>.onrender.com
CORS_ORIGINS=https://<your-store>.vercel.app,https://<your-admin>.vercel.app
```

Redeploy backend sau khi đổi CORS.

---

## Production Checklist (sau deploy)

| Chức năng | Cách kiểm tra |
|-----------|---------------|
| Trang chủ load | Mở URL Vercel trên mobile/desktop |
| Đăng ký / Đăng nhập | Dùng `user@vixxy.com / user123` hoặc tạo tài khoản mới |
| Xem sản phẩm | `/products` — lọc, tìm kiếm |
| Giỏ hàng | Thêm sản phẩm → `/cart` |
| Thanh toán QR Demo | Checkout → quét QR → mock payment |
| Chat AI | Widget chat góc phải |
| Chat Realtime | Tạo session chat, staff/admin nhận qua Socket.IO |
| Admin Dashboard | Đăng nhập `admin@vixxy.com / admin123` |
| API Health | `GET /health` trên Render URL |

---

## Troubleshooting

### Backend không start / crash loop

- Kiểm tra `DATABASE_URL` đúng format Supabase pooler
- Xem Render Logs → tìm lỗi Prisma hoặc Sequelize
- Đảm bảo `JWT_SECRET` đã set (không dùng giá trị mặc định)

### CORS error trên browser

- Kiểm tra `CORS_ORIGINS` khớp chính xác URL Vercel (không có `/` cuối)
- Redeploy backend sau khi sửa env

### Login không hoạt động

- Kiểm tra `NEXT_PUBLIC_API_URL` trỏ đúng Render URL + `/api`
- Wake up backend Render trước (truy cập `/health`)
- Kiểm tra đã seed: `SEED_ON_START=true` lần deploy đầu

### Socket.IO không kết nối

- `NEXT_PUBLIC_SOCKET_URL` = Render URL (không có `/api`)
- Render Free hỗ trợ WebSocket — đảm bảo backend đang chạy (không sleep)

### Render sleep (cold start)

- Lần đầu truy cập sau 15 phút idle: đợi ~30–60 giây
- Có thể dùng cron job miễn phí (UptimeRobot) ping `/health` mỗi 14 phút

---

## Tài liệu liên quan

- [DEPLOY.md](../DEPLOY.md) — Hướng dẫn deploy tóm tắt
- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) — Chi tiết biến môi trường
- [vixxy-store/API_GUIDE.md](../vixxy-store/API_GUIDE.md) — API mock payment/shipping
