# HƯỚNG DẪN CÀI ĐẶT DATABASE VỚI SQL SERVER MANAGEMENT STUDIO 21

## Yêu cầu trước khi bắt đầu
- Đã cài đặt **SQL Server** (bất kỳ phiên bản nào, khuyến nghị Express trở lên)
- Đã cài đặt **SQL Server Management Studio 21**
- Đã tải xuống file `schema-sqlserver.sql` (nằm trong `docs/04-database-design/`)

---

## Bước 1: Mở SQL Server Management Studio 21
1. Mở **SQL Server Management Studio 21**
2. Trong hộp thoại **Connect to Server**:
   - **Server type**: Chọn `Database Engine`
   - **Server name**: Nhập tên server SQL của bạn (thường là `localhost` hoặc `.\SQLEXPRESS` nếu dùng Express)
   - **Authentication**: Chọn `Windows Authentication` (hoặc `SQL Server Authentication` nếu bạn có tài khoản SQL)
3. Nhấn **Connect** để kết nối

---

## Bước 2: Chạy script tạo database
1. Trong **Object Explorer**, nhấn chuột phải vào tên server của bạn → Chọn **New Query**
2. Mở file `schema-sqlserver.sql` (trong thư mục `docs/04-database-design/`) bằng trình soạn thảo văn bản (Notepad, VS Code, ...)
3. Sao chép toàn bộ nội dung file và dán vào cửa sổ **Query** vừa mở
4. Nhấn nút **Execute** (hoặc nhấn phím `F5`) để chạy script
5. Chờ cho đến khi thấy thông báo `Commands completed successfully.` ở tab **Messages**

---

## Bước 3: Kiểm tra database đã được tạo
1. Trong **Object Explorer**, mở rộng **Databases**
2. Bạn sẽ thấy database **vixxy_dorance** đã được tạo
3. Mở rộng **vixxy_dorance** → **Tables** để xem tất cả các bảng đã được tạo

---

## Bước 4: Cấu hình kết nối trong dự án (Backend)
Bạn cần cập nhật chuỗi kết nối (connection string) trong file `.env` của backend để kết nối đến SQL Server:

### Ví dụ cho Windows Authentication
```env
DATABASE_URL="Server=localhost;Database=vixxy_dorance;Trusted_Connection=True;TrustServerCertificate=True;"
```

### Ví dụ cho SQL Server Authentication
```env
DATABASE_URL="Server=localhost;Database=vixxy_dorance;User Id=your_username;Password=your_password;TrustServerCertificate=True;"
```

---

## (Tùy chọn) Thêm dữ liệu mẫu vào database
Nếu bạn muốn thêm dữ liệu mẫu để kiểm tra, hãy chạy các lệnh INSERT sau:

### Thêm vai trò mặc định (nếu chưa có)
```sql
USE vixxy_dorance;
GO

INSERT INTO [dbo].[roles] ([roleName], [description])
VALUES 
(N'admin', N'System administrator'),
(N'customer', N'Regular customer'),
(N'staff', N'Staff member');
GO
```

### Thêm người dùng admin mẫu
```sql
-- Lưu ý: passwordHash là hash của mật khẩu, bạn nên sử dụng hàm hash thực tế
INSERT INTO [dbo].[users] ([email], [passwordHash], [fullName], [status], [emailVerified])
VALUES 
(N'admin@vixxy.com', N'$2a$10$YourHashedPasswordHere', N'Admin Vixxy', N'active', 1);
GO

-- Gán vai trò admin cho người dùng vừa tạo
DECLARE @adminRoleId INT = (SELECT [id] FROM [dbo].[roles] WHERE [roleName] = N'admin');
DECLARE @adminUserId INT = (SELECT [id] FROM [dbo].[users] WHERE [email] = N'admin@vixxy.com');

INSERT INTO [dbo].[user_roles] ([userId], [roleId])
VALUES (@adminUserId, @adminRoleId);
GO
```

---

## Lưu ý quan trọng
- **Backup**: Hãy thường xuyên backup database `vixxy_dorance` để tránh mất dữ liệu
- **Collation**: Sử dụng collation `SQL_Latin1_General_CP1_CI_AS` để hỗ trợ tiếng Việt tốt
- **Security**: Không để chuỗi kết nối chứa mật khẩu được commit lên repository

---

## Tệp tham khảo
- File schema SQL Server: [schema-sqlserver.sql](file:///c:/TMDT(LT)/vixxy/vixxy-fashion/docs/04-database-design/schema-sqlserver.sql)
- File schema gốc: [schema.sql](file:///c:/TMDT(LT)/vixxy/vixxy-fashion/docs/04-database-design/schema.sql)
