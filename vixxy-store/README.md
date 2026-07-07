# VIXXY D'ORANCE - Website chính

Đây là web chính nên dùng cho project hiện tại. Các file HTML ở thư mục gốc, `novachat`, `admin`, và `admin-dashboard` đang là bản phụ/bản thử nghiệm; không cần chạy chung nếu bạn muốn một website thống nhất.

## Công nghệ

- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Framer Motion

## Trang

| Route | Mô tả |
|-------|--------|
| `/` | Trang chủ — hero, trang phục, trang sức, phụ kiện |
| `/products` | Danh sách sản phẩm + lọc + tìm kiếm |
| `/products/[id]` | Chi tiết sản phẩm |
| `/cart` | Giỏ hàng, cập nhật số lượng, thanh toán demo |
| `/chat` | Chat hỗ trợ, tạo nhóm, thêm thành viên |
| `/login` | Đăng nhập |
| `/register` | Đăng ký |

**Tài khoản demo:** `demo@vixxy.com` / `1234`

## Cài đặt

1. Cài dependency và chạy:

   ```bash
   cd vixxy-store
   npm install
   npm run dev
   ```

2. Mở [http://localhost:3000](http://localhost:3000)

## Build production

```bash
npm run build
npm start
```

Deploy phù hợp: Vercel, Netlify, hoặc `npm run build` + static host.

## Cấu trúc

```
vixxy-store/
├── app/              # Pages (App Router)
├── components/       # UI tái sử dụng
├── context/          # Cart + Auth
├── lib/              # Dữ liệu sản phẩm mock
└── public/images/    # Assets hình ảnh
```

## Ghi chú logic hiện tại

- Giỏ hàng và tài khoản demo lưu bằng `localStorage`/`sessionStorage`.
- Thanh toán là demo frontend, chưa kết nối cổng thanh toán thật.
- Chat là demo frontend, chưa có database hoặc realtime server.
- Dữ liệu sản phẩm nằm ở `lib/products.ts`; khi làm bản thật có thể thay bằng API hoặc CMS.
