# VIXXY D'ORANCE - Huong dan project

Project hien co nhieu ban thu nghiem. De tranh bi roi, hay xem `vixxy-store/` la website chinh.

## Website chinh

```bash
cd vixxy-store
npm install
npm run dev
```

Sau do mo dung dia chi Terminal bao. Mac nen uu tien:

```text
http://127.0.0.1:3000
```

## Chức năng trong website chính

- **Trang chủ:** Hero Banner dạng slideshow động, lấy dữ liệu cấu hình từ trang Admin; danh mục sản phẩm nổi bật.
- **Sản phẩm:** Lọc theo danh mục, tìm kiếm, sắp xếp theo giá.
- **Chi tiết sản phẩm:** Chọn size, số lượng, thêm vào giỏ hàng.
- **Giỏ hàng:** Lưu trữ local, cập nhật số lượng theo từng size, thanh toán.
- **Thanh toán (Checkout):** 
  - Áp dụng mã giảm giá (Voucher) tự động tính toán số tiền giảm.
  - Cơ chế **giữ chỗ tồn kho (Stock Hold)** tạm thời khi thanh toán để tránh tranh chấp kho.
  - Tích hợp cổng thanh toán giả lập **QR Demo (SePay)**.
- **Hủy & Khôi phục giao dịch (Rollback):** Tự động hoàn kho và trả lại Voucher nếu người dùng hủy thanh toán giữa chừng.
- **Tài khoản:** 
  - Khách hàng đăng ký/đăng nhập.
  - Admin quản trị.
- **Đơn hàng & Hoàn tiền (Refund):** Khách hàng xem lịch sử đơn hàng, yêu cầu hoàn tiền khi đơn hàng đã giao (`delivered`).
- **Trang Admin (`/admin/dashboard`):**
  - **Sản phẩm:** Quản lý danh sách, chỉnh sửa, thêm/xóa sản phẩm và tồn kho.
  - **Đơn hàng:** Quản lý tất cả đơn hàng, duyệt/từ chối yêu cầu hoàn tiền kèm lý do từ chối.
  - **Mã giảm giá:** Tạo mới voucher (giảm %, số tiền cố định), quản lý giới hạn sử dụng, khóa/mở khóa voucher.
  - **Banner:** Thêm/xóa các banner tiếp thị hiển thị trực tiếp lên slide trang chủ.

Tài khoản Demo mặc định:
- **Tài khoản Khách hàng:** `user@vixxy.com` / mật khẩu `user123`
- **Tài khoản Admin:** `admin@vixxy.com` / mật khẩu `admin123`

---

## Cách chạy dự án cục bộ (Local Development)

1. Di chuyển vào thư mục dự án Next.js:
   ```bash
   cd vixxy-store
   ```
2. Cài đặt các thư viện (dependencies):
   ```bash
   npm install
   ```
3. Chạy môi trường phát triển:
   ```bash
   npm run dev
   ```
4. Mở trình duyệt theo địa chỉ: [http://localhost:3000](http://localhost:3000)

---

## File nén phiên bản sạch (Clean Archive)

Phiên bản nén sạch của dự án đã được tạo tại tệp tin:
👉 **[vixxy_ecommerce_project.zip](file:///c:/Users/Admin/OneDrive/Documents/năm%204/pro_vy/vixxy_ecommerce_project.zip)**

Tệp tin này đã được lọc bỏ hoàn toàn các thư mục nặng như `node_modules`, `.next`, `.vercel`, và các file cấu hình tạm thời khác để đảm bảo dung lượng tối ưu, phục vụ việc nộp bài hoặc lưu trữ.

---

## Deploy Production

Xem hướng dẫn đầy đủ:
- [DEPLOY.md](DEPLOY.md)
- [docs/PRODUCTION_GUIDE.md](docs/PRODUCTION_GUIDE.md)
- [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md)

Sau khi deploy, website hoat dong tai URL cong khai (vi du: `https://vixxy-dorance.vercel.app`).
