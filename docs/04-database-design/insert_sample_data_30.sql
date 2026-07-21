-- =============================================================
-- Insert 30 Sample Records for Vixxy Fashion Database
-- =============================================================
USE [vixxy_dorance];
GO

PRINT '=';
PRINT 'Starting to insert 30 sample records per table...';
PRINT '=';
GO

-- =============================================================
-- Step 1: Insert 30 Sample Customers (Users)
-- =============================================================
PRINT 'Inserting 30 sample customers...';
GO

-- First, check what user IDs already exist to avoid conflicts
DECLARE @MaxUserId INT;
SELECT @MaxUserId = ISNULL(MAX([id]), 0) FROM [dbo].[users];
PRINT 'Current max user ID: ' + CAST(@MaxUserId AS VARCHAR);
GO

-- Define sample Vietnamese names
DECLARE @VietnameseNames TABLE (
    [FullName] NVARCHAR(255) NOT NULL,
    [Email] NVARCHAR(100) NOT NULL,
    [Phone] NVARCHAR(20) NOT NULL,
    [Gender] NVARCHAR(10) NOT NULL,
    [City] NVARCHAR(100) NOT NULL
);

INSERT INTO @VietnameseNames ([FullName], [Email], [Phone], [Gender], [City])
VALUES
    (N'Nguyễn Văn An', N'nguyenvana@gmail.com', N'0901234501', 'male', N'Hà Nội'),
    (N'Trần Minh Khang', N'tranminhkhang@gmail.com', N'0901234502', 'male', N'TP. Hồ Chí Minh'),
    (N'Lê Hoàng Nam', N'lehoangnam@gmail.com', N'0901234503', 'male', N'Đà Nẵng'),
    (N'Phạm Gia Hân', N'phamgiahan@gmail.com', N'0901234504', 'female', N'Hải Phòng'),
    (N'Đỗ Khánh Vy', N'dokhanhvy@gmail.com', N'0901234505', 'female', N'Cần Thơ'),
    (N'Nguyễn Minh Quân', N'nguyenminhquan@gmail.com', N'0901234506', 'male', N'Nha Trang'),
    (N'Hoàng Gia Bảo', N'hoanggiabao@gmail.com', N'0901234507', 'male', N'Vũng Tàu'),
    (N'Trần Ngọc Anh', N'trngocanh@gmail.com', N'0901234508', 'female', N'Đà Lạt'),
    (N'Lê Quốc Huy', N'lequochuy@gmail.com', N'0901234509', 'male', N'Phú Quốc'),
    (N'Phạm Thanh Tùng', N'phamthanhtung@gmail.com', N'0901234510', 'male', N'Quy Nhơn'),
    (N'Nguyễn Thị Hà', N'nguyenthih@gmail.com', N'0901234511', 'female', N'Hà Nội'),
    (N'Trương Thảo Ly', N'truongthaoly@gmail.com', N'0901234512', 'female', N'TP. Hồ Chí Minh'),
    (N'Đinh Công Thành', N'dinhcongthanh@gmail.com', N'0901234513', 'male', N'Đà Nẵng'),
    (N'Phan Thị Mai', N'phanthimai@gmail.com', N'0901234514', 'female', N'Hải Phòng'),
    (N'Vũ Việt Hoàng', N'vuviet hoang@gmail.com', N'0901234515', 'male', N'Cần Thơ'),
    (N'Ngô Thị Hồng Nhung', N'ngothihongnhung@gmail.com', N'0901234516', 'female', N'Nha Trang'),
    (N'Lý Quốc Đạt', N'lyquocdat@gmail.com', N'0901234517', 'male', N'Vũng Tàu'),
    (N'Chu Thị Trang', N'chuthitrang@gmail.com', N'0901234518', 'female', N'Đà Lạt'),
    (N'Đỗ Đức Dũng', N'doducdung@gmail.com', N'0901234519', 'male', N'Phú Quốc'),
    (N'Nguyễn Thu Thảo', N'nguyenthuthao@gmail.com', N'0901234520', 'female', N'Quy Nhơn'),
    (N'Phạm Minh Tuấn', N'phamminhtuan@gmail.com', N'0901234521', 'male', N'Hà Nội'),
    (N'Lê Thị Hồng Nhung', N'lethihongnhung@gmail.com', N'0901234522', 'female', N'TP. Hồ Chí Minh'),
    (N'Hoàng Văn Cường', N'hoangvancuong@gmail.com', N'0901234523', 'male', N'Đà Nẵng'),
    (N'Trần Thị Thúy', N'tranthithuy@gmail.com', N'0901234524', 'female', N'Hải Phòng'),
    (N'Nguyễn Văn Hưng', N'nguyenvanhung@gmail.com', N'0901234525', 'male', N'Cần Thơ'),
    (N'Phan Thị Diễm', N'phanthidiem@gmail.com', N'0901234526', 'female', N'Nha Trang'),
    (N'Đỗ Văn Khải', N'dovankhai@gmail.com', N'0901234527', 'male', N'Vũng Tàu'),
    (N'Nguyễn Thị Yến', N'nguyenthyen@gmail.com', N'0901234528', 'female', N'Đà Lạt'),
    (N'Lưu Văn Đạt', N'luuvandat@gmail.com', N'0901234529', 'male', N'Phú Quốc'),
    (N'Võ Thị Thảo', N'vothithao@gmail.com', N'0901234530', 'female', N'Quy Nhơn');

-- Now insert these as customers
SET IDENTITY_INSERT [dbo].[users] ON;

DECLARE @Counter INT = 1;
DECLARE @NewId INT;
DECLARE @FullName NVARCHAR(255);
DECLARE @Email NVARCHAR(100);
DECLARE @Phone NVARCHAR(20);
DECLARE @Gender NVARCHAR(10);
DECLARE @City NVARCHAR(100);
DECLARE @BirthDate DATETIME;

WHILE @Counter <= 30
BEGIN
    SELECT 
        @FullName = [FullName], 
        @Email = [Email], 
        @Phone = [Phone], 
        @Gender = [Gender], 
        @City = [City]
    FROM @VietnameseNames
    WHERE ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) = @Counter; -- Wait, fix this!
    
    -- Alternative way using OFFSET/FETCH
    SELECT TOP 1
        @FullName = [FullName], 
        @Email = [Email], 
        @Phone = [Phone], 
        @Gender = [Gender], 
        @City = [City]
    FROM @VietnameseNames
    ORDER BY [FullName]
    OFFSET @Counter - 1 ROWS FETCH NEXT 1 ROWS ONLY;
    
    SET @NewId = @MaxUserId + @Counter;
    SET @BirthDate = DATEADD(YEAR, - (20 + FLOOR(RAND() * 30)), GETDATE());
    
    -- Check if user already exists
    IF NOT EXISTS (SELECT * FROM [dbo].[users] WHERE [id] = @NewId)
    BEGIN
        INSERT INTO [dbo].[users] (
            [id], [email], [phone], [username], [passwordHash], 
            [fullName], [avatar], [birthday], [gender], 
            [address], [status], [emailVerified], [phoneVerified], 
            [createdAt], [updatedAt]
        ) VALUES (
            @NewId,
            @Email,
            @Phone,
            LOWER(REPLACE(@FullName, N' ', N'')), -- username without spaces
            N'$2b$10$N9qo8uLOickvxPsW3J6Z1e6q1iXb4w6H3J6Q0J4Z7W9Z5e6X7Q9aK', -- sample password hash
            @FullName,
            N'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', -- sample avatar
            @BirthDate,
            @Gender,
            N'Số ' + CAST(FLOOR(100 + RAND() * 900) AS NVARCHAR(10)) + N' Đường ABC, ' + @City,
            N'active',
            1, -- email verified
            1, -- phone verified
            DATEADD(DAY, - (FLOOR(RAND() * 365)), GETDATE()), -- created in last year
            GETDATE()
        );
    END

    -- Assign customer role
    IF NOT EXISTS (SELECT * FROM [dbo].[user_roles] WHERE [userId] = @NewId AND [roleId] = 2)
    BEGIN
        INSERT INTO [dbo].[user_roles] ([userId], [roleId], [createdAt])
        VALUES (@NewId, 2, GETDATE());
    END

    SET @Counter = @Counter + 1;
END

SET IDENTITY_INSERT [dbo].[users] OFF;
PRINT 'Successfully inserted 30 customers!';
GO

-- =============================================================
-- Step 2: Insert 30 Addresses
-- =============================================================
PRINT 'Inserting 30 addresses...';
GO

DECLARE @AddressCounter INT = 1;
DECLARE @CurrentMaxUserId INT;
SELECT @CurrentMaxUserId = ISNULL(MAX([id]), 0) FROM [dbo].[users];
DECLARE @StartUserId INT = @CurrentMaxUserId - 29; -- 30 users
PRINT 'Inserting addresses for user IDs ' + CAST(@StartUserId AS VARCHAR) + ' to ' + CAST(@CurrentMaxUserId AS VARCHAR);
GO

SET IDENTITY_INSERT [dbo].[addresses] ON;
DECLARE @AddCounter INT = 1;
WHILE @AddCounter <= 30
BEGIN
    DECLARE @AddUserId INT = @StartUserId + (@AddCounter - 1);
    DECLARE @AddUserFullName NVARCHAR(255);
    DECLARE @AddUserPhone NVARCHAR(20);
    DECLARE @AddCity NVARCHAR(100);
    DECLARE @AddDistrict NVARCHAR(100);
    DECLARE @AddWard NVARCHAR(100);
    
    -- Get user details
    SELECT @AddUserFullName = [fullName], @AddUserPhone = [phone]
    FROM [dbo].[users] WHERE [id] = @AddUserId;
    
    -- Generate district and ward
    DECLARE @Districts TABLE ([Name] NVARCHAR(100));
    INSERT INTO @Districts VALUES 
        (N'Quận 1'), (N'Quận 2'), (N'Quận 3'), (N'Quận 4'), (N'Quận 5'),
        (N'Quận 6'), (N'Quận 7'), (N'Quận 8'), (N'Quận 9'), (N'Quận 10');
    
    DECLARE @Wards TABLE ([Name] NVARCHAR(100));
    INSERT INTO @Wards VALUES 
        (N'Phường 1'), (N'Phường 2'), (N'Phường 3'), (N'Phường 4'), (N'Phường 5'),
        (N'Phường 6'), (N'Phường 7'), (N'Phường 8'), (N'Phường 9'), (N'Phường 10');
    
    -- Pick random district and ward
    SELECT TOP 1 @AddDistrict = [Name] FROM @Districts ORDER BY NEWID();
    SELECT TOP 1 @AddWard = [Name] FROM @Wards ORDER BY NEWID();
    
    -- Pick random city
    DECLARE @Cities TABLE ([Name] NVARCHAR(100));
    INSERT INTO @Cities VALUES 
        (N'Hà Nội'), (N'TP. Hồ Chí Minh'), (N'Đà Nẵng'), (N'Hải Phòng'), (N'Cần Thơ'),
        (N'Nha Trang'), (N'Vũng Tàu'), (N'Đà Lạt'), (N'Phú Quốc'), (N'Quy Nhơn');
    SELECT TOP 1 @AddCity = [Name] FROM @Cities ORDER BY NEWID();
    
    -- Insert address
    IF NOT EXISTS (SELECT * FROM [dbo].[addresses] WHERE [id] = @AddCounter)
    BEGIN
        INSERT INTO [dbo].[addresses] (
            [id], [userId], [fullName], [phone], [addressLine1], 
            [city], [district], [ward], [isDefault], [createdAt], [updatedAt]
        ) VALUES (
            @AddCounter,
            @AddUserId,
            @AddUserFullName,
            @AddUserPhone,
            N'Số ' + CAST(FLOOR(10 + RAND() * 999) AS NVARCHAR(10)) + N' Đường Lê Lợi',
            @AddCity,
            @AddDistrict,
            @AddWard,
            1, -- is default
            DATEADD(DAY, - (FLOOR(RAND() * 300)), GETDATE()),
            GETDATE()
        );
    END
    SET @AddCounter = @AddCounter + 1;
END
SET IDENTITY_INSERT [dbo].[addresses] OFF;
PRINT 'Successfully inserted 30 addresses!';
GO

-- =============================================================
-- Step 3: Insert 30 Products (if needed)
-- =============================================================
PRINT 'Checking and inserting 30 products...';
GO

DECLARE @CurrentProductCount INT;
SELECT @CurrentProductCount = COUNT(*) FROM [dbo].[products];
PRINT 'Current product count: ' + CAST(@CurrentProductCount AS VARCHAR);
GO

-- If less than 30, add more
IF (SELECT COUNT(*) FROM [dbo].[products]) < 30
BEGIN
    PRINT 'Adding more products to reach 30...';

    DECLARE @ProductNames TABLE ([Name] NVARCHAR(255), [Slug] NVARCHAR(255), [Price] DECIMAL(12,2));
    INSERT INTO @ProductNames VALUES
        (N'Áo thun cotton unisex', N'ao-thun-cotton-unisex', 199000),
        (N'Quần jean skinny nam', N'quan-jean-skinny-nam', 499000),
        (N'Đầm chữ A nữ', N'dam-chu-a-nu', 699000),
        (N'Áo sơ mi công sở', N'ao-so-mi-cong-so', 399000),
        (N'Váy midi hoa văn', N'vay-midi-hoa-van', 599000),
        (N'Áo khoác bomber', N'ao-khoac-bomber', 899000),
        (N'Giày sneaker trắng', N'giay-sneaker-trang', 599000),
        (N'Áo len cổ tròn', N'ao-len-co-tron', 449000),
        (N'Quần kaki nam', N'quan-kaki-nam', 349000),
        (N'Đầm maxi màu xanh', N'dam-maxi-mau-xanh', 799000),
        (N'Áo thun có họa tiết', N'ao-thun-co-hoa-tiet', 249000),
        (N'Quần shorts nữ', N'quan-shorts-nu', 299000),
        (N'Áo vest nam', N'ao-vest-nam', 1299000),
        (N'Chân váy pencil', N'chan-vay-pencil', 449000),
        (N'Áo cardigan', N'ao-cardigan', 549000),
        (N'Quần tây công sở', N'quan-tay-cong-so', 499000),
        (N'Đầm dự tiệc', N'dam-du-tiec', 1499000),
        (N'Áo polo nam', N'ao-polo-nam', 349000),
        (N'Váy yếm', N'vay-yem', 399000),
        (N'Áo hoodie', N'ao-hoodie', 649000),
        (N'Quần jogger', N'quan-jogger', 449000),
        (N'Đầm bodycon', N'dam-bodycon', 749000),
        (N'Áo sơ mi kẻ sọc', N'ao-so-mi-ke-soc', 449000),
        (N'Giày sandal nữ', N'giay-sandal-nu', 349000),
        (N'Áo blazer nữ', N'ao-blazer-nu', 999000),
        (N'Quần legging', N'quan-legging', 249000),
        (N'Đầm peplum', N'dam-peplum', 699000),
        (N'Áo hai dây', N'ao-hai-day', 199000),
        (N'Giày boots nam', N'giay-boots-nam', 1099000),
        (N'Váy xòe ngắn', N'vay-xoe-ngan', 349000);

    DECLARE @ProductCounter INT = (SELECT ISNULL(MAX([id]), 0) FROM [dbo].[products]) + 1;
    DECLARE @TargetProductCount INT = 30;
    
    SET IDENTITY_INSERT [dbo].[products] ON;
    
    WHILE @ProductCounter <= @TargetProductCount
    BEGIN
        -- Pick random product
        DECLARE @PName NVARCHAR(255);
        DECLARE @PSlug NVARCHAR(255);
        DECLARE @PPrice DECIMAL(12,2);
        DECLARE @PDesc NVARCHAR(MAX);
        DECLARE @PSku NVARCHAR(50);
        
        SELECT TOP 1 
            @PName = [Name], 
            @PSlug = [Slug] + N'-' + CAST(@ProductCounter AS NVARCHAR(10)),
            @PPrice = [Price]
        FROM @ProductNames 
        ORDER BY NEWID();
        
        SET @PSku = N'PROD-' + RIGHT('00000' + CAST(@ProductCounter AS NVARCHAR(10)), 5);
        SET @PDesc = N'Sản phẩm ' + @PName + N' chất lượng cao, thiết kế hiện đại, phù hợp cho nhiều dịp.';
        
        IF NOT EXISTS (SELECT * FROM [dbo].[products] WHERE [id] = @ProductCounter)
        BEGIN
            INSERT INTO [dbo].[products] (
                [id], [name], [slug], [description], [shortDescription], 
                [sku], [price], [discountPrice], [stockQuantity], 
                [isActive], [isFeatured], [viewCount], [saleCount], 
                [createdAt], [updatedAt]
            ) VALUES (
                @ProductCounter,
                @PName,
                @PSlug,
                @PDesc,
                LEFT(@PDesc, 100), -- short description
                @PSku,
                @PPrice,
                CASE WHEN RAND() > 0.5 THEN @PPrice * 0.8 ELSE NULL END, -- 20% discount sometimes
                FLOOR(20 + RAND() * 100), -- stock
                1, -- active
                CASE WHEN RAND() > 0.7 THEN 1 ELSE 0 END, -- featured sometimes
                FLOOR(100 + RAND() * 5000), -- view count
                FLOOR(10 + RAND() * 200), -- sale count
                DATEADD(DAY, - (FLOOR(RAND() * 365)), GETDATE()),
                GETDATE()
            );
        END
        SET @ProductCounter = @ProductCounter + 1;
    END
    
    SET IDENTITY_INSERT [dbo].[products] OFF;
    PRINT 'Successfully added products! Now total: ' + CAST((SELECT COUNT(*) FROM [dbo].[products]) AS VARCHAR);
END
ELSE
BEGIN
    PRINT 'Already have enough products!';
END
GO

-- =============================================================
-- Step 4: Insert 30 Reviews
-- =============================================================
PRINT 'Inserting 30 reviews...';
GO

DECLARE @ReviewCounter INT = 1;
DECLARE @CurrentMaxReviewId INT;
SELECT @CurrentMaxReviewId = ISNULL(MAX([id]), 0) FROM [dbo].[reviews];
SET @ReviewCounter = @CurrentMaxReviewId + 1;
GO

SET IDENTITY_INSERT [dbo].[reviews] ON;
DECLARE @RevCount INT = 1;
WHILE @RevCount <= 30
BEGIN
    DECLARE @RevId INT = @CurrentMaxReviewId + @RevCount;
    DECLARE @RevProductId INT;
    DECLARE @RevUserId INT;
    DECLARE @RevRating INT;
    DECLARE @RevTitle NVARCHAR(255);
    DECLARE @RevContent NVARCHAR(MAX);
    DECLARE @RevImages NVARCHAR(MAX);
    DECLARE @RevSize NVARCHAR(20);
    DECLARE @RevColor NVARCHAR(50);
    DECLARE @RevCity NVARCHAR(100);
    DECLARE @RevHelpfulCount INT;
    
    -- Pick random product and user (from our new users)
    SELECT TOP 1 @RevProductId = [id] FROM [dbo].[products] ORDER BY NEWID();
    SELECT TOP 1 @RevUserId = [id] FROM [dbo].[users] WHERE [id] > @MaxUserId - 30 ORDER BY NEWID(); -- only new users
    
    -- Pick random rating (3-5 stars mostly)
    SET @RevRating = CASE 
        WHEN RAND() > 0.8 THEN 5
        WHEN RAND() > 0.6 THEN 4
        WHEN RAND() > 0.3 THEN 3
        ELSE 2
    END;
    
    -- Review titles & contents
    DECLARE @ReviewData TABLE (
        [Title] NVARCHAR(255), 
        [Content] NVARCHAR(MAX)
    );
    INSERT INTO @ReviewData VALUES
        (N'Sản phẩm rất đẹp, đúng hình', N'Sản phẩm rất đẹp, đúng như hình ảnh minh họa trên website. Chất lượng tốt, đáng tiền.'),
        (N'Giao hàng nhanh, đóng gói cẩn thận', N'Giao hàng siêu nhanh, đúng lịch hẹn. Đóng gói sản phẩm cẩn thận, không bị hư hỏng gì.'),
        (N'Chất liệu khá tốt', N'Chất liệu vải khá tốt, mặc thoải mái. Form chuẩn theo size chart. Sẽ ủng hộ shop tiếp.'),
        (N'Đáng tiền', N'Giá hợp lý so với chất lượng. Sản phẩm đúng như mô tả, rất hài lòng với mua hàng lần này.'),
        (N'Ổn trong tầm giá', N'Ổn, đúng tầm giá. Không có gì quá đặc biệt nhưng cũng không có gì để chê.'),
        (N'Nhân viên tư vấn nhiệt tình', N'Nhân viên tư vấn rất nhiệt tình, hỗ trợ chọn size rất chính xác. Sản phẩm đẹp.'),
        (N'Màu sắc đẹp', N'Màu sắc sản phẩm thật đẹp, không bị khác biệt với ảnh. Rất ưng ý.'),
        (N'Form chuẩn', N'Form áo rất chuẩn, vừa vặn với body. Chất vải mềm, thấm hút mồ hôi tốt.'),
        (N'Sẽ quay lại', N'Rất hài lòng với sản phẩm và dịch vụ của shop. Sẽ quay lại mua thêm lần nữa.'),
        (N'Tuyệt vời', N'Tuyệt vời! Không có gì để chê. Sản phẩm đẹp, chất lượng, giao hàng nhanh.'),
        (N'Chất vải dày', N'Chất vải khá dày, ấm áp, phù hợp cho thời tiết se lạnh. Rất thích.'),
        (N'Giày nhẹ, đi thoải mái', N'Giày rất nhẹ, đi cả ngày cũng không đau chân. Thiết kế đẹp, rất đáng tiền.'),
        (N'Đầm mặc rất đẹp', N'Đầm mặc lên rất đẹp, form chuẩn. Chất liệu cao cấp, không bị nhão.'),
        (N'Áo khoác ấm áp', N'Áo khoác rất ấm, chất da mềm, thiết kế sang trọng. Rất hài lòng.'),
        (N'Giao hàng đúng hạn', N'Giao hàng đúng như dự kiến. Sản phẩm đúng như trong ảnh, rất đẹp.'),
        (N'Vải mềm mại', N'Chất liệu vải mềm mại, không gây kích ứng da. Mặc rất thoải mái.'),
        (N'Size chuẩn', N'Size chart rất chuẩn, chọn đúng size là vừa vặn. Sản phẩm đẹp.'),
        (N'Đóng gói đẹp', N'Đóng gói sản phẩm rất đẹp, như một món quà. Rất ưng ý.'),
        (N'Rất đáng tiền', N'Chất lượng sản phẩm tốt, giá hợp lý. Rất đáng tiền so với những gì nhận được.'),
        (N'Phong cách hiện đại', N'Thiết kế sản phẩm rất hiện đại, thời trang. Nhiều bạn bè khen đẹp.'),
        (N'Nhiệt tình, nhanh nhẹn', N'Nhân viên tư vấn rất nhiệt tình, giải đáp mọi thắc mắc nhanh chóng.'),
        (N'Đúng như mô tả', N'Sản phẩm đúng như mô tả trên website, không có gì khác biệt.'),
        (N'Rất hài lòng', N'Từ sản phẩm đến dịch vụ đều rất tốt. Rất hài lòng và sẽ giới thiệu bạn bè.'),
        (N'Chất lượng cao', N'Chất lượng sản phẩm rất cao, như hàng hiệu. Rất đáng tiền.'),
        (N'Nhanh chóng, tiện lợi', N'Mua hàng rất nhanh chóng, tiện lợi. Giao hàng đúng hẹn.'),
        (N'Sẽ ủng hộ lâu dài', N'Lần đầu mua hàng ở shop nhưng rất ưng ý. Sẽ ủng hộ shop lâu dài.'),
        (N'Đẹp và chất lượng', N'Sản phẩm vừa đẹp vừa chất lượng. Giá hợp lý, rất đáng tiền.'),
        (N'Không thể chê', N'Từ A-Z đều hoàn hảo. Không thể chê được điều gì.'),
        (N'Rất ưng ý', N'Rất ưng ý với sản phẩm và dịch vụ của shop. Sẽ mua lại.'),
        (N'Tuyệt đối hài lòng', N'Tuyệt đối hài lòng với mọi thứ. Sẽ giới thiệu cho bạn bè và người thân.');
    
    -- Pick random review data
    SELECT TOP 1 @RevTitle = [Title], @RevContent = [Content] FROM @ReviewData ORDER BY NEWID();
    
    -- Pick random size & color
    DECLARE @Sizes TABLE ([Size] NVARCHAR(20));
    INSERT INTO @Sizes VALUES (N'S'), (N'M'), (N'L'), (N'XL'), (N'XXL');
    SELECT TOP 1 @RevSize = [Size] FROM @Sizes ORDER BY NEWID();
    
    DECLARE @Colors TABLE ([Color] NVARCHAR(50));
    INSERT INTO @Colors VALUES (N'Trắng'), (N'Đen'), (N'Xanh dương'), (N'Đỏ'), (N'Vàng'), (N'Nâu'), (N'Hồng'), (N'Xám'), (N'Xanh lá');
    SELECT TOP 1 @RevColor = [Color] FROM @Colors ORDER BY NEWID();
    
    -- Get user's city
    SELECT @RevCity = ISNULL(SUBSTRING([address], CHARINDEX(N',', [address]) + 2, LEN([address])), N'TP. Hồ Chí Minh') 
    FROM [dbo].[users] WHERE [id] = @RevUserId;
    
    -- Random helpful count
    SET @RevHelpfulCount = FLOOR(RAND() * 50);
    
    -- Random images (sometimes yes, sometimes no)
    SET @RevImages = CASE 
        WHEN RAND() > 0.7 THEN N'["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"]' 
        ELSE NULL 
    END;
    
    IF NOT EXISTS (SELECT * FROM [dbo].[reviews] WHERE [id] = @RevId)
    BEGIN
        INSERT INTO [dbo].[reviews] (
            [id], [productId], [userId], [rating], [title], [comment], 
            [images], [size], [color], [city], [likesCount], [helpfulCount], 
            [hasPurchased], [reply], [repliedAt], [status], [createdAt], [updatedAt]
        ) VALUES (
            @RevId,
            @RevProductId,
            @RevUserId,
            @RevRating,
            @RevTitle,
            @RevContent,
            @RevImages,
            @RevSize,
            @RevColor,
            @RevCity,
            FLOOR(RAND() * 30), -- likes count
            @RevHelpfulCount,
            1, -- has purchased
            NULL,
            NULL,
            N'APPROVED',
            DATEADD(DAY, - (FLOOR(RAND() * 180)), GETDATE()), -- in last 6 months
            GETDATE()
        );
    END
    SET @RevCount = @RevCount + 1;
END
SET IDENTITY_INSERT [dbo].[reviews] OFF;
PRINT 'Successfully inserted 30 reviews!';
GO

-- =============================================================
-- Step 5: Insert 30 Orders
-- =============================================================
PRINT 'Inserting 30 orders...';
GO

DECLARE @OrderCounter INT = (SELECT ISNULL(MAX([id]), 0) FROM [dbo].[orders]) + 1;
SET IDENTITY_INSERT [dbo].[orders] ON;

DECLARE @OrdCount INT = 1;
WHILE @OrdCount <= 30
BEGIN
    DECLARE @OrdId INT = @OrderCounter + @OrdCount - 1;
    DECLARE @OrdUserId INT;
    DECLARE @OrdNumber NVARCHAR(50);
    DECLARE @OrdStatus NVARCHAR(50);
    DECLARE @OrdTotalAmount DECIMAL(12,2);
    DECLARE @OrdShippingFee DECIMAL(12,2);
    DECLARE @OrdTaxAmount DECIMAL(12,2);
    DECLARE @OrdDiscountAmount DECIMAL(12,2);
    DECLARE @OrdPaymentMethod NVARCHAR(50);
    DECLARE @OrdPaymentStatus NVARCHAR(50);
    DECLARE @OrdShippingAddress NVARCHAR(MAX);
    DECLARE @OrdCreatedAt DATETIME;
    DECLARE @OrdPaidAt DATETIME;
    DECLARE @OrdShippedAt DATETIME;
    DECLARE @OrdDeliveredAt DATETIME;
    DECLARE @OrdAddressId INT;
    
    -- Pick random user from our new customers
    SELECT TOP 1 @OrdUserId = [id] FROM [dbo].[users] WHERE [id] > (@CurrentMaxUserId - 30) ORDER BY NEWID();
    SELECT TOP 1 @OrdAddressId = [id] FROM [dbo].[addresses] WHERE [userId] = @OrdUserId ORDER BY NEWID();
    
    -- Pick order status
    DECLARE @Statuses TABLE ([Status] NVARCHAR(50));
    INSERT INTO @Statuses VALUES (N'PENDING'), (N'PROCESSING'), (N'SHIPPING'), (N'DELIVERED'), (N'CANCELLED'), (N'REPENDING'), (N'REJECTED');
    SELECT TOP 1 @OrdStatus = [Status] FROM @Statuses ORDER BY NEWID();
    IF @OrdStatus = N'REPENDING' SET @OrdStatus = N'REFUNDED';
    
    -- Generate order number
    SET @OrdNumber = N'ORD-' + RIGHT(N'000000' + CAST(@OrdId AS NVARCHAR(10)), 6);
    
    -- Generate total amount
    SET @OrdTotalAmount = FLOOR(300000 + RAND() * 2000000);
    
    -- Shipping fee (free if > 500k)
    SET @OrdShippingFee = CASE WHEN @OrdTotalAmount > 500000 THEN 0 ELSE 30000 END;
    
    -- Tax amount (10%)
    SET @OrdTaxAmount = FLOOR(@OrdTotalAmount * 0.1);
    
    -- Discount (sometimes)
    SET @OrdDiscountAmount = CASE WHEN RAND() > 0.7 THEN FLOOR(50000 + RAND() * 200000) ELSE 0 END;
    
    -- Payment method
    DECLARE @PayMethods TABLE ([Method] NVARCHAR(50));
    INSERT INTO @PayMethods VALUES (N'COD'), (N'MOMO'), (N'ZALOPAY'), (N'QR_DEMO');
    SELECT TOP 1 @OrdPaymentMethod = [Method] FROM @PayMethods ORDER BY NEWID();
    
    -- Payment status based on order status
    SET @OrdPaymentStatus = CASE
        WHEN @OrdStatus IN (N'DELIVERED', N'PROCESSING', N'SHIPPING') THEN N'PAID'
        WHEN @OrdStatus = N'REJECTED' OR @OrdStatus = N'CANCELLED' THEN N'FAILED'
        WHEN @OrdStatus = N'REPENDING' OR @OrdStatus = N'REPENDING' OR @OrdStatus = N'REFUNDED' THEN N'REPENDING'
        ELSE N'PENDING'
    END;
    -- Fix refunded status
    IF @OrdStatus = N'REFUNDED' SET @OrdPaymentStatus = N'REPENDING';
    IF @OrdPaymentStatus = N'REPENDING' SET @OrdPaymentStatus = N'REPENDING';
    IF @OrdPaymentStatus = N'REPENDING' SET @OrdPaymentStatus = N'REFUNDED';
    
    -- Get shipping address as JSON
    SELECT @OrdShippingAddress = (
        SELECT 
            [fullName] AS name, 
            [phone] AS phone, 
            [addressLine1] AS address, 
            [city] AS city, 
            [district] AS district, 
            [ward] AS ward
        FROM [dbo].[addresses] WHERE [id] = @OrdAddressId
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
    );
    
    -- Set dates based on order status
    SET @OrdCreatedAt = DATEADD(DAY, - (FLOOR(RAND() * 90)), GETDATE()); -- last 3 months
    SET @OrdPaidAt = CASE WHEN @OrdPaymentStatus IN (N'PAID', N'REPENDING', N'REFUNDED') THEN DATEADD(HOUR, (FLOOR(1 + RAND() * 48)), @OrdCreatedAt) ELSE NULL END;
    SET @OrdShippedAt = CASE WHEN @OrdStatus IN (N'SHIPPING', N'DELIVERED', N'REPENDING', N'REFUNDED') THEN DATEADD(DAY, (FLOOR(1 + RAND() * 7)), @OrdPaidAt) ELSE NULL END;
    SET @OrdDeliveredAt = CASE WHEN @OrdStatus IN (N'DELIVERED', N'REPENDING', N'REFUNDED') THEN DATEADD(DAY, (FLOOR(1 + RAND() * 14)), @OrdShippedAt) ELSE NULL END;
    
    IF NOT EXISTS (SELECT * FROM [dbo].[orders] WHERE [id] = @OrdId)
    BEGIN
        INSERT INTO [dbo].[orders] (
            [id], [userId], [orderNumber], [orderStatus], [totalAmount], 
            [shippingFee], [taxAmount], [discountAmount], [shippingAddress], 
            [paymentMethod], [paymentStatus], [notes], [paidAt], [shippedAt], 
            [deliveredAt], [createdAt], [updatedAt]
        ) VALUES (
            @OrdId,
            @OrdUserId,
            @OrdNumber,
            @OrdStatus,
            @OrdTotalAmount,
            @OrdShippingFee,
            @OrdTaxAmount,
            @OrdDiscountAmount,
            @OrdShippingAddress,
            @OrdPaymentMethod,
            @OrdPaymentStatus,
            CASE WHEN RAND() > 0.8 THEN N'Gọi trước khi giao' ELSE NULL END,
            @OrdPaidAt,
            @OrdShippedAt,
            @OrdDeliveredAt,
            @OrdCreatedAt,
            GETDATE()
        );
    END
    SET @OrdCount = @OrdCount + 1;
END
SET IDENTITY_INSERT [dbo].[orders] OFF;
PRINT 'Successfully inserted 30 orders!';
GO

-- =============================================================
-- Step 6: Insert Order Details (3 items per order, ~90 total)
-- =============================================================
PRINT 'Inserting order details...';
GO

DECLARE @OrdDetCounter INT = (SELECT ISNULL(MAX([id]), 0) FROM [dbo].[order_details]) + 1;
SET IDENTITY_INSERT [dbo].[order_details] ON;

DECLARE @StartOrderId INT = (SELECT ISNULL(MAX([id]), 0) FROM [dbo].[orders]) - 29; -- last 30 orders
DECLARE @EndOrderId INT = (SELECT ISNULL(MAX([id]), 0) FROM [dbo].[orders]);

DECLARE @CurrentOrderId INT = @StartOrderId;
WHILE @CurrentOrderId <= @EndOrderId
BEGIN
    DECLARE @ItemsPerOrder INT = FLOOR(1 + RAND() * 4); -- 1-4 items
    DECLARE @ItemCount INT = 1;
    
    WHILE @ItemCount <= @ItemsPerOrder
    BEGIN
        DECLARE @ODProductId INT;
        DECLARE @ODProductName NVARCHAR(255);
        DECLARE @ODProductSku NVARCHAR(50);
        DECLARE @ODProductImage NVARCHAR(255);
        DECLARE @ODPrice DECIMAL(12,2);
        DECLARE @ODSize NVARCHAR(20);
        DECLARE @ODColor NVARCHAR(50);
        DECLARE @ODQuantity INT;
        
        -- Pick random product
        SELECT TOP 1 
            @ODProductId = [id], 
            @ODProductName = [name], 
            @ODProductSku = [sku], 
            @ODPrice = ISNULL([discountPrice], [price])
        FROM [dbo].[products] ORDER BY NEWID();
        
        -- Get product image
        SELECT TOP 1 @ODProductImage = [imageUrl] 
        FROM [dbo].[product_images] 
        WHERE [productId] = @ODProductId 
        ORDER BY [isPrimary] DESC;
        IF @ODProductImage IS NULL SET @ODProductImage = N'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop';
        
        -- Random size & color
        DECLARE @ODSizes TABLE ([Size] NVARCHAR(20));
        INSERT INTO @ODSizes VALUES (N'S'), (N'M'), (N'L'), (N'XL');
        SELECT TOP 1 @ODSize = [Size] FROM @ODSizes ORDER BY NEWID();
        
        DECLARE @ODColors TABLE ([Color] NVARCHAR(50));
        INSERT INTO @ODColors VALUES (N'Trắng'), (N'Đen'), (N'Xanh dương'), (N'Đỏ'), (N'Vàng');
        SELECT TOP 1 @ODColor = [Color] FROM @ODColors ORDER BY NEWID();
        
        -- Random quantity (1-3)
        SET @ODQuantity = FLOOR(1 + RAND() * 3);
        
        IF NOT EXISTS (SELECT * FROM [dbo].[order_details] WHERE [id] = @OrdDetCounter)
        BEGIN
            INSERT INTO [dbo].[order_details] (
                [id], [orderId], [productId], [productName], 
                [productSku], [productImage], [quantity], [price], 
                [size], [color], [createdAt]
            ) VALUES (
                @OrdDetCounter,
                @CurrentOrderId,
                @ODProductId,
                @ODProductName,
                @ODProductSku,
                @ODProductImage,
                @ODQuantity,
                @ODPrice,
                @ODSize,
                @ODColor,
                GETDATE()
            );
        END
        SET @OrdDetCounter = @OrdDetCounter + 1;
        SET @ItemCount = @ItemCount + 1;
    END
    SET @CurrentOrderId = @CurrentOrderId + 1;
END
SET IDENTITY_INSERT [dbo].[order_details] OFF;
PRINT 'Successfully inserted order details!';
GO

-- =============================================================
-- Step 7: Insert 30 Vouchers
-- =============================================================
PRINT 'Inserting 30 vouchers...';
GO

DECLARE @VoucherCounter INT = (SELECT ISNULL(MAX([id]), 0) FROM [dbo].[vouchers]) + 1;
SET IDENTITY_INSERT [dbo].[vouchers] ON;

DECLARE @VCount INT = 1;
WHILE @VCount <= 30
BEGIN
    DECLARE @VId INT = @VoucherCounter + @VCount - 1;
    DECLARE @VCode NVARCHAR(50);
    DECLARE @VDiscountType NVARCHAR(20);
    DECLARE @VDiscountValue DECIMAL(12,2);
    DECLARE @VMinOrderValue DECIMAL(12,2);
    DECLARE @VMaxUsage INT;
    DECLARE @VUsedCount INT;
    DECLARE @VStartDate DATETIME;
    DECLARE @VEndDate DATETIME;
    DECLARE @VIsActive BIT;
    
    -- Voucher codes
    DECLARE @VoucherPrefixes TABLE ([Prefix] NVARCHAR(50));
    INSERT INTO @VoucherPrefixes VALUES 
        (N'SUMMER'), (N'WELCOME'), (N'SALE'), (N'VIP'), (N'NEW'),
        (N'AUTUMN'), (N'SPRING'), (N'HOLIDAY'), (N'FLASH'), (N'BIRTHDAY');
    DECLARE @Prefix NVARCHAR(50);
    SELECT TOP 1 @Prefix = [Prefix] FROM @VoucherPrefixes ORDER BY NEWID();
    
    SET @VCode = @Prefix + CAST(FLOOR(10 + RAND() * 99) AS NVARCHAR(10)); -- e.g., SUMMER23
    
    -- Discount type
    SET @VDiscountType = CASE WHEN RAND() > 0.5 THEN N'fixed' ELSE N'percent' END;
    
    -- Discount value
    IF @VDiscountType = N'fixed'
        SET @VDiscountValue = FLOOR(50000 + RAND() * 300000); -- 50k - 300k
    ELSE
        SET @VDiscountValue = FLOOR(5 + RAND() * 30); -- 5% - 30%
    
    -- Min order value
    SET @VMinOrderValue = CASE WHEN RAND() > 0.5 THEN FLOOR(200000 + RAND() * 500000) ELSE 0 END;
    
    -- Max usage
    SET @VMaxUsage = FLOOR(100 + RAND() * 1000);
    
    -- Used count (less than max)
    SET @VUsedCount = FLOOR(RAND() * @VMaxUsage);
    
    -- Date range
    SET @VStartDate = DATEADD(DAY, - (FLOOR(RAND() * 30)), GETDATE());
    SET @VEndDate = DATEADD(DAY, (30 + FLOOR(RAND() * 60)), @VStartDate);
    
    -- Active
    SET @VIsActive = CASE WHEN RAND() > 0.2 THEN 1 ELSE 0 END;
    
    IF NOT EXISTS (SELECT * FROM [dbo].[vouchers] WHERE [id] = @VId)
    BEGIN
        INSERT INTO [dbo].[vouchers] (
            [id], [code], [discountType], [discountValue], 
            [minOrderValue], [maxUsage], [usedCount], 
            [startDate], [endDate], [isActive], [createdAt], [updatedAt]
        ) VALUES (
            @VId,
            @VCode,
            @VDiscountType,
            @VDiscountValue,
            @VMinOrderValue,
            @VMaxUsage,
            @VUsedCount,
            @VStartDate,
            @VEndDate,
            @VIsActive,
            DATEADD(DAY, - (FLOOR(RAND() * 60)), GETDATE()),
            GETDATE()
        );
    END
    SET @VCount = @VCount + 1;
END
SET IDENTITY_INSERT [dbo].[vouchers] OFF;
PRINT 'Successfully inserted 30 vouchers!';
GO

-- =============================================================
-- Step 8: Insert OrderVouchers
-- =============================================================
PRINT 'Inserting OrderVouchers...';
GO

DECLARE @OVCounter INT = (SELECT ISNULL(MAX([id]), 0) FROM [dbo].[order_vouchers]) + 1;
SET IDENTITY_INSERT [dbo].[order_vouchers] ON;

DECLARE @StartOVOrderId INT = @StartOrderId;
DECLARE @EndOVOrderId INT = @EndOrderId;
DECLARE @OVCurrentOrderId INT = @StartOVOrderId;
WHILE @OVCurrentOrderId <= @EndOVOrderId
BEGIN
    -- Sometimes use a voucher
    IF RAND() > 0.6
    BEGIN
        DECLARE @OVVoucherId INT;
        SELECT TOP 1 @OVVoucherId = [id] FROM [dbo].[vouchers] WHERE [isActive] = 1 ORDER BY NEWID();
        
        IF NOT EXISTS (SELECT * FROM [dbo].[order_vouchers] WHERE [id] = @OVCounter)
        BEGIN
            INSERT INTO [dbo].[order_vouchers] ([id], [orderId], [voucherId], [createdAt])
            VALUES (@OVCounter, @OVCurrentOrderId, @OVVoucherId, GETDATE());
            SET @OVCounter = @OVCounter + 1;
        END
    END
    SET @OVCurrentOrderId = @OVCurrentOrderId + 1;
END
SET IDENTITY_INSERT [dbo].[order_vouchers] OFF;
PRINT 'Successfully inserted OrderVouchers!';
GO

-- =============================================================
-- Step 9: Insert Payments
-- =============================================================
PRINT 'Inserting payments...';
GO

DECLARE @PayCounter INT = (SELECT ISNULL(MAX([id]), 0) FROM [dbo].[payments]) + 1;
SET IDENTITY_INSERT [dbo].[payments] ON;

DECLARE @PayCurrentOrderId INT = @StartOrderId;
WHILE @PayCurrentOrderId <= @EndOrderId
BEGIN
    DECLARE @PayAmount DECIMAL(12,2);
    DECLARE @PayMethod NVARCHAR(50);
    DECLARE @PayStatus NVARCHAR(50);
    DECLARE @PayTransactionId NVARCHAR(255);
    DECLARE @PayPaidAt DATETIME;
    
    SELECT 
        @PayAmount = [totalAmount],
        @PayMethod = [paymentMethod],
        @PayStatus = [paymentStatus],
        @PayPaidAt = [paidAt]
    FROM [dbo].[orders] WHERE [id] = @PayCurrentOrderId;
    
    SET @PayTransactionId = N'TXN-' + RIGHT(N'000000' + CAST(@PayCounter AS NVARCHAR(10)), 6);
    
    IF NOT EXISTS (SELECT * FROM [dbo].[payments] WHERE [id] = @PayCounter)
    BEGIN
        INSERT INTO [dbo].[payments] (
            [id], [orderId], [paymentMethod], [amount], [transactionId], 
            [paymentStatus], [paidAt], [createdAt], [updatedAt]
        ) VALUES (
            @PayCounter,
            @PayCurrentOrderId,
            @PayMethod,
            @PayAmount,
            @PayTransactionId,
            @PayStatus,
            @PayPaidAt,
            GETDATE(),
            GETDATE()
        );
    END
    SET @PayCounter = @PayCounter + 1;
    SET @PayCurrentOrderId = @PayCurrentOrderId + 1;
END
SET IDENTITY_INSERT [dbo].[payments] OFF;
PRINT 'Successfully inserted payments!';
GO

-- =============================================================
-- Step 10: Insert Payment Logs
-- =============================================================
PRINT 'Inserting payment logs...';
GO

DECLARE @PLCounter INT = (SELECT ISNULL(MAX([id]), 0) FROM [dbo].[payment_logs]) + 1;
SET IDENTITY_INSERT [dbo].[payment_logs] ON;

DECLARE @StartPayId INT = (SELECT ISNULL(MAX([id]), 0) FROM [dbo].[payments]) - 29;
DECLARE @EndPayId INT = (SELECT ISNULL(MAX([id]), 0) FROM [dbo].[payments]);
DECLARE @PLCounter INT = 1;
WHILE @PLCounter <= 30
BEGIN
    DECLARE @PLPayId INT = @StartPayId + @PLCounter - 1;
    
    -- Insert CREATE_QR log
    IF NOT EXISTS (SELECT * FROM [dbo].[payment_logs] WHERE [id] = @PLCounter)
    BEGIN
        INSERT INTO [dbo].[payment_logs] (
            [id], [paymentId], [requestData], [responseData], [logType], [createdAt]
        ) VALUES (
            @PLCounter,
            @PLPayId,
            N'{"test":"request"}',
            N'{"success":true}',
            N'CREATE_QR',
            GETDATE()
        );
    END
    
    -- Insert SUCCESS log if payment is paid
    DECLARE @PLStatus NVARCHAR(50);
    SELECT @PLStatus = [paymentStatus] FROM [dbo].[payments] WHERE [id] = @PLPayId;
    IF @PLStatus IN (N'PAID', N'REFUNDED')
    BEGIN
        DECLARE @PLCounter2 INT = @PLCounter + 30; -- shift
        IF NOT EXISTS (SELECT * FROM [dbo].[payment_logs] WHERE [id] = @PLCounter2)
        BEGIN
            INSERT INTO [dbo].[payment_logs] (
                [id], [paymentId], [requestData], [responseData], [logType], [createdAt]
            ) VALUES (
                @PLCounter2,
                @PLPayId,
                N'{"test":"payment"}',
                N'{"success":true}',
                N'PAYMENT_SUCCESS',
                GETDATE()
            );
        END
    END
    SET @PLCounter = @PLCounter + 1;
END
SET IDENTITY_INSERT [dbo].[payment_logs] OFF;
PRINT 'Successfully inserted payment logs!';
GO

-- =============================================================
-- Step 11: Insert Shippings
-- =============================================================
PRINT 'Inserting shippings...';
GO

DECLARE @ShipCounter INT = (SELECT ISNULL(MAX([id]), 0) FROM [dbo].[shippings]) + 1;
SET IDENTITY_INSERT [dbo].[shippings] ON;

DECLARE @ShipCurrentOrderId INT = @StartOrderId;
WHILE @ShipCurrentOrderId <= @EndOrderId
BEGIN
    DECLARE @ShipTrackingCode NVARCHAR(100);
    DECLARE @ShipPartner NVARCHAR(100);
    DECLARE @ShipStatus NVARCHAR(50);
    DECLARE @ShipEstimated DATETIME;
    DECLARE @ShipActual DATETIME;
    
    -- Get order data
    DECLARE @ShipOrderStatus NVARCHAR(50);
    DECLARE @ShipShippedAt DATETIME;
    DECLARE @ShipDeliveredAt DATETIME;
    SELECT 
        @ShipOrderStatus = [orderStatus], 
        @ShipShippedAt = [shippedAt], 
        @ShipDeliveredAt = [deliveredAt]
    FROM [dbo].[orders] WHERE [id] = @ShipCurrentOrderId;
    
    -- Shipping partner
    DECLARE @Partners TABLE ([Name] NVARCHAR(100));
    INSERT INTO @Partners VALUES (N'GHTK'), (N'Viettel Post'), (N'J&T Express'), (N'GHN');
    SELECT TOP 1 @ShipPartner = [Name] FROM @Partners ORDER BY NEWID();
    
    -- Tracking code
    SET @ShipTrackingCode = @ShipPartner + CAST(FLOOR(10000000 + RAND() * 90000000) AS NVARCHAR(10));
    
    -- Shipping status
    SET @ShipStatus = CASE
        WHEN @ShipOrderStatus = N'DELIVERED' THEN N'DELIVERED'
        WHEN @ShipOrderStatus = N'SHIPPING' THEN N'IN_TRANSIT'
        WHEN @ShipOrderStatus = N'PROCESSING' OR @ShipOrderStatus = N'PENDING' THEN N'PENDING'
        ELSE N'PENDING'
    END;
    
    -- Dates
    SET @ShipEstimated = CASE WHEN @ShipShippedAt IS NOT NULL THEN DATEADD(DAY, 3, @ShipShippedAt) ELSE NULL END;
    SET @ShipActual = @ShipDeliveredAt;
    
    IF NOT EXISTS (SELECT * FROM [dbo].[shippings] WHERE [id] = @ShipCounter)
    BEGIN
        INSERT INTO [dbo].[shippings] (
            [id], [orderId], [trackingCode], [shippingPartner], 
            [shippingStatus], [estimatedDelivery], [actualDelivery], 
            [createdAt], [updatedAt]
        ) VALUES (
            @ShipCounter,
            @ShipCurrentOrderId,
            @ShipTrackingCode,
            @ShipPartner,
            @ShipStatus,
            @ShipEstimated,
            @ShipActual,
            GETDATE(),
            GETDATE()
        );
    END
    SET @ShipCounter = @ShipCounter + 1;
    SET @ShipCurrentOrderId = @ShipCurrentOrderId + 1;
END
SET IDENTITY_INSERT [dbo].[shippings] OFF;
PRINT 'Successfully inserted shippings!';
GO

-- =============================================================
-- Step 12: Insert Refund Requests (30)
-- =============================================================
PRINT 'Inserting refund requests...';
GO

DECLARE @RefundCounter INT = (SELECT ISNULL(MAX([id]), 0) FROM [dbo].[refund_requests]) + 1;
SET IDENTITY_INSERT [dbo].[refund_requests] ON;

DECLARE @RCount INT = 1;
WHILE @RCount <= 30
BEGIN
    DECLARE @RId INT = @RefundCounter + @RCount - 1;
    DECLARE @ROrderId INT;
    DECLARE @RReason NVARCHAR(MAX);
    DECLARE @RStatus NVARCHAR(50);
    DECLARE @RRequestedAt DATETIME;
    DECLARE @RResolvedAt DATETIME;
    DECLARE @RResolutionNote NVARCHAR(MAX);
    
    -- Pick random order
    SELECT TOP 1 @ROrderId = [id] FROM [dbo].[orders] ORDER BY NEWID();
    
    -- Reason
    DECLARE @RReasons TABLE ([Reason] NVARCHAR(MAX));
    INSERT INTO @RReasons VALUES
        (N'Sản phẩm không giống mô tả'),
        (N'Sản phẩm bị hư hỏng'),
        N'Đổi size/màu',
        N'Không cần thiết nữa',
        N'Giao hàng quá chậm';
    SELECT TOP 1 @RReason = [Reason] FROM @RReasons ORDER BY NEWID();
    
    -- Status
    SET @RStatus = CASE
        WHEN RAND() > 0.6 THEN N'APPROVED'
        WHEN RAND() > 0.3 THEN N'REJECTED'
        ELSE N'PENDING'
    END;
    
    -- Dates
    SET @RRequestedAt = DATEADD(DAY, - (FLOOR(RAND() * 60)), GETDATE());
    SET @RResolvedAt = CASE WHEN @RStatus <> N'PENDING' THEN DATEADD(DAY, (FLOOR(1 + RAND() * 7)), @RRequestedAt) ELSE NULL END;
    
    -- Resolution note
    SET @RResolutionNote = CASE
        WHEN @RStatus = N'APPROVED' THEN N'Yêu cầu hoàn trả đã được chấp thuận. Vui lòng chờ xử lý.'
        WHEN @RStatus = N'REJECTED' THEN N'Yêu cầu hoàn trả không đủ điều kiện. Vui lòng liên hệ hỗ trợ.'
        ELSE NULL
    END;
    
    IF NOT EXISTS (SELECT * FROM [dbo].[refund_requests] WHERE [id] = @RId)
    BEGIN
        INSERT INTO [dbo].[refund_requests] (
            [id], [orderId], [reason], [status], 
            [requestedAt], [resolvedAt], [resolutionNote]
        ) VALUES (
            @RId,
            @ROrderId,
            @RReason,
            @RStatus,
            @RRequestedAt,
            @RResolvedAt,
            @RResolutionNote
        );
    END
    SET @RCount = @RCount + 1;
END
SET IDENTITY_INSERT [dbo].[refund_requests] OFF;
PRINT 'Successfully inserted refund requests!';
GO

-- =============================================================
-- Step 13: Insert 30 Banners
-- =============================================================
PRINT 'Inserting 30 banners...';
GO

DECLARE @BannerCounter INT = (SELECT ISNULL(MAX([id]), 0) FROM [dbo].[banners]) + 1;
SET IDENTITY_INSERT [dbo].[banners] ON;

DECLARE @BCount INT = 1;
WHILE @BCount <= 30
BEGIN
    DECLARE @BId INT = @BannerCounter + @BCount - 1;
    DECLARE @BTitle NVARCHAR(255);
    DECLARE @BSubtitle NVARCHAR(255);
    DECLARE @BImageUrl NVARCHAR(255);
    DECLARE @BLinkUrl NVARCHAR(255);
    DECLARE @BIsActive BIT;
    DECLARE @BSortOrder INT;
    
    -- Banner data
    DECLARE @BData TABLE ([Title] NVARCHAR(255), [Subtitle] NVARCHAR(255));
    INSERT INTO @BData VALUES
        (N'Khuyến mãi hè', N'Giảm đến 50%'),
        (N'Bộ sưu tập mới', N'Spring/Summer'),
        (N'Miễn phí vận chuyển', N'Đơn hàng từ 500k'),
        (N'Sale cuối tuần', N'Chỉ 3 ngày'),
        (N'Flash sale', N'Giờ vàng'),
        (N'Chương trình VIP', N'Ưu đãi đặc biệt'),
        (N'Đồng phục công sở', N'Giá tốt'),
        (N'Quà tặng tri ân', N'Độc quyền'),
        (N'Thu đông 2024', N'Bộ sưu tập mới'),
        (N'Black Friday', N'Siêu khuyến mãi');
    SELECT TOP 1 @BTitle = [Title], @BSubtitle = [Subtitle] FROM @BData ORDER BY NEWID();
    SET @BTitle = @BTitle + N' #' + CAST(@BCount AS NVARCHAR(10)); -- unique
    
    -- Image
    SET @BImageUrl = N'https://images.unsplash.com/photo-' + CAST(1441986300917 + @BCount AS NVARCHAR(20)) + N'?w=1200&h=400&fit=crop';
    -- Backup image if invalid
    IF @BImageUrl IS NULL SET @BImageUrl = N'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=400&fit=crop';
    
    -- Link
    SET @BLinkUrl = N'/collections/sale';
    
    -- Active & sort
    SET @BIsActive = CASE WHEN RAND() > 0.2 THEN 1 ELSE 0 END;
    SET @BSortOrder = @BCount;
    
    IF NOT EXISTS (SELECT * FROM [dbo].[banners] WHERE [id] = @BId)
    BEGIN
        INSERT INTO [dbo].[banners] (
            [id], [title], [subtitle], [imageUrl], [linkUrl], 
            [isActive], [sortOrder], [createdAt], [updatedAt]
        ) VALUES (
            @BId,
            @BTitle,
            @BSubtitle,
            @BImageUrl,
            @BLinkUrl,
            @BIsActive,
            @BSortOrder,
            DATEADD(DAY, - (FLOOR(RAND() * 90)), GETDATE()),
            GETDATE()
        );
    END
    SET @BCount = @BCount + 1;
END
SET IDENTITY_INSERT [dbo].[banners] OFF;
PRINT 'Successfully inserted 30 banners!';
GO

-- =============================================================
-- Step 14: Insert 30 Notifications
-- =============================================================
PRINT 'Inserting 30 notifications...';
GO

DECLARE @NotifCounter INT = (SELECT ISNULL(MAX([id]), 0) FROM [dbo].[notifications]) + 1;
SET IDENTITY_INSERT [dbo].[notifications] ON;

DECLARE @NCount INT = 1;
WHILE @NCount <= 30
BEGIN
    DECLARE @NId INT = @NotifCounter + @NCount - 1;
    DECLARE @NUserId INT;
    DECLARE @NType NVARCHAR(50);
    DECLARE @NTitle NVARCHAR(255);
    DECLARE @NMessage NVARCHAR(MAX);
    DECLARE @NData NVARCHAR(MAX);
    DECLARE @NIsRead BIT;
    DECLARE @NReadAt DATETIME;
    
    -- Pick user
    SELECT TOP 1 @NUserId = [id] FROM [dbo].[users] WHERE [id] > (@CurrentMaxUserId - 30) ORDER BY NEWID();
    
    -- Type
    DECLARE @NTypes TABLE ([Type] NVARCHAR(50));
    INSERT INTO @NTypes VALUES (N'ORDER'), (N'REVIEW'), (N'PROMOTION'), (N'NEWS');
    SELECT TOP 1 @NType = [Type] FROM @NTypes ORDER BY NEWID();
    
    -- Title & message
    DECLARE @NDataTbl TABLE ([Title] NVARCHAR(255), [Message] NVARCHAR(MAX));
    INSERT INTO @NDataTbl VALUES
        (N'Đơn hàng của bạn đã được giao!', N'Đơn hàng của bạn đã được giao thành công. Vui lòng kiểm tra và đánh giá sản phẩm!'),
        (N'Bạn có đánh giá mới!', N'Một khách hàng vừa để lại đánh giá cho sản phẩm của bạn.'),
        (N'Khuyến mãi hè 2024', N'Chương trình khuyến mãi hè lớn nhất năm! Giảm đến 50%.'),
        (N'Bộ sưu tập mới!', N'Bộ sưu tập mới đã có mặt trên website. Hãy khám phá ngay!');
    SELECT TOP 1 @NTitle = [Title], @NMessage = [Message] FROM @NDataTbl ORDER BY NEWID();
    
    -- Read status
    SET @NIsRead = CASE WHEN RAND() > 0.4 THEN 1 ELSE 0 END;
    SET @NReadAt = CASE WHEN @NIsRead = 1 THEN DATEADD(HOUR, (FLOOR(1 + RAND() * 48)), GETDATE()) ELSE NULL END;
    
    IF NOT EXISTS (SELECT * FROM [dbo].[notifications] WHERE [id] = @NId)
    BEGIN
        INSERT INTO [dbo].[notifications] (
            [id], [userId], [type], [title], [message], 
            [data], [isRead], [readAt], [createdAt]
        ) VALUES (
            @NId,
            @NUserId,
            @NType,
            @NTitle,
            @NMessage,
            NULL,
            @NIsRead,
            @NReadAt,
            DATEADD(DAY, - (FLOOR(RAND() * 30)), GETDATE())
        );
    END
    SET @NCount = @NCount + 1;
END
SET IDENTITY_INSERT [dbo].[notifications] OFF;
PRINT 'Successfully inserted 30 notifications!';
GO

-- =============================================================
-- Step 15: Insert 30 Chat Sessions & 300 Chat Messages
-- =============================================================
PRINT 'Inserting chat sessions and messages...';
GO

DECLARE @ChatSessionCounter INT = (SELECT ISNULL(MAX([id]), 0) FROM [dbo].[chat_sessions]) + 1;
SET IDENTITY_INSERT [dbo].[chat_sessions] ON;

-- First insert 30 chat sessions
DECLARE @CSCount INT = 1;
WHILE @CSCount <= 30
BEGIN
    DECLARE @CSId INT = @ChatSessionCounter + @CSCount - 1;
    DECLARE @CSCustomerId INT;
    DECLARE @CSStaffId INT;
    DECLARE @CSStatus NVARCHAR(50);
    DECLARE @CSPriority NVARCHAR(20);
    DECLARE @CSSubject NVARCHAR(255);
    DECLARE @CSCreatedAt DATETIME;
    
    -- Pick customer
    SELECT TOP 1 @CSCustomerId = [id] FROM [dbo].[users] WHERE [id] > (@CurrentMaxUserId - 30) ORDER BY NEWID();
    
    -- Staff (sometimes unassigned)
    SET @CSStaffId = CASE WHEN RAND() > 0.3 THEN 2 ELSE NULL END; -- Staff user with id 2
    
    -- Status
    SET @CSStatus = CASE WHEN RAND() > 0.4 THEN N'CLOSED' ELSE N'OPEN' END;
    
    -- Priority
    SET @CSPriority = CASE WHEN RAND() > 0.7 THEN N'HIGH' WHEN RAND() > 0.3 THEN N'MEDIUM' ELSE N'LOW' END;
    
    -- Subject
    DECLARE @CSSubjects TABLE ([Subject] NVARCHAR(255));
    INSERT INTO @CSSubjects VALUES
        (N'Hỏi về sản phẩm'),
        (N'Hỏi về size'),
        (N'Hỏi về vận chuyển'),
        (N'Hỏi về đổi trả'),
        (N'Hỗ trợ kỹ thuật');
    SELECT TOP 1 @CSSubject = [Subject] FROM @CSSubjects ORDER BY NEWID();
    
    -- Created at
    SET @CSCreatedAt = DATEADD(DAY, - (FLOOR(RAND() * 90)), GETDATE());
    
    IF NOT EXISTS (SELECT * FROM [dbo].[chat_sessions] WHERE [id] = @CSId)
    BEGIN
        INSERT INTO [dbo].[chat_sessions] (
            [id], [customerId], [staffId], [status], 
            [priority], [subject], [createdAt], [updatedAt]
        ) VALUES (
            @CSId,
            @CSCustomerId,
            @CSStaffId,
            @CSStatus,
            @CSPriority,
            @CSSubject,
            @CSCreatedAt,
            GETDATE()
        );
    END
    SET @CSCount = @CSCount + 1;
END
SET IDENTITY_INSERT [dbo].[chat_sessions] OFF;

-- Now insert chat messages (10 per session = 300 total)
DECLARE @ChatMsgCounter INT = (SELECT ISNULL(MAX([id]), 0) FROM [dbo].[chat_messages]) + 1;
SET IDENTITY_INSERT [dbo].[chat_messages] ON;

DECLARE @StartCSId INT = @ChatSessionCounter;
DECLARE @EndCSId INT = @ChatSessionCounter + 29;
DECLARE @CurrentCSId INT = @StartCSId;
WHILE @CurrentCSId <= @EndCSId
BEGIN
    DECLARE @MsgCountPerSession INT = 10; -- 10 per session
    DECLARE @MsgCount INT = 1;
    
    -- Get session details
    DECLARE @CSCustomerId2 INT;
    DECLARE @CSStaffId2 INT;
    SELECT @CSCustomerId2 = [customerId], @CSStaffId2 = [staffId] FROM [dbo].[chat_sessions] WHERE [id] = @CurrentCSId;
    
    WHILE @MsgCount <= @MsgCountPerSession
    BEGIN
        DECLARE @CMId INT = @ChatMsgCounter;
        DECLARE @CMSenderType NVARCHAR(20);
        DECLARE @CMSenderId INT;
        DECLARE @CMContent NVARCHAR(MAX);
        DECLARE @CMIsRead BIT;
        DECLARE @CMCreatedAt DATETIME;
        
        -- Alternate sender (user, staff, bot, etc.)
        IF @MsgCount % 3 = 1
            SET @CMSenderType = N'USER'
        ELSE IF @MsgCount %3 = 2
            SET @CMSenderType = CASE WHEN @CSStaffId2 IS NOT NULL THEN N'STAFF' ELSE N'BOT' END
        ELSE
            SET @CMSenderType = N'USER';
        
        -- Sender id
        IF @CMSenderType = N'USER'
            SET @CMSenderId = @CSCustomerId2
        ELSE IF @CMSenderType = N'STAFF'
            SET @CMSenderId = @CSStaffId2
        ELSE
            SET @CMSenderId = 2; -- bot uses staff id?
        
        -- Message content
        DECLARE @CMUserMsgs TABLE ([Content] NVARCHAR(MAX));
        INSERT INTO @CMUserMsgs VALUES
            (N'Chào shop, cho em hỏi sản phẩm này còn hàng không?'),
            (N'Size này là size M đúng không ạ?'),
            (N'Giao hàng mất bao lâu vậy?'),
            (N'Em muốn đổi size được không?'),
            (N'Có chương trình khuyến mãi nào không?');
        
        DECLARE @CMStaffMsgs TABLE ([Content] NVARCHAR(MAX));
        INSERT INTO @CMStaffMsgs VALUES
            (N'Dạ vâng em! Sản phẩm này còn hàng đầy đủ ạ.'),
            (N'Dạ đúng rồi em! Size chart shop chuẩn lắm.'),
            (N'Giao hàng mất 3-5 ngày làm việc em nhé!'),
            (N'Em đổi được trong vòng 7 ngày kể từ khi nhận hàng ạ.'),
            (N'Hiện tại shop có chương trình giảm đến 50% nè!');
        
        DECLARE @CMBotMsgs TABLE ([Content] NVARCHAR(MAX));
        INSERT INTO @CMBotMsgs VALUES
            (N'Xin chào bạn! Chúng tôi có thể giúp gì cho bạn?'),
            (N'Vui lòng chờ, chúng tôi sẽ kết nối bạn với nhân viên hỗ trợ!');
        
        IF @CMSenderType = N'USER'
            SELECT TOP 1 @CMContent = [Content] FROM @CMUserMsgs ORDER BY NEWID()
        ELSE IF @CMSenderType = N'STAFF'
            SELECT TOP 1 @CMContent = [Content] FROM @CMStaffMsgs ORDER BY NEWID()
        ELSE
            SELECT TOP 1 @CMContent = [Content] FROM @CMBotMsgs ORDER BY NEWID();
        
        -- Read status
        SET @CMIsRead = CASE WHEN RAND() > 0.3 THEN 1 ELSE 0 END;
        
        -- Created at (incremental)
        DECLARE @CSCreatedAt2 DATETIME;
        SELECT @CSCreatedAt2 = [createdAt] FROM [dbo].[chat_sessions] WHERE [id] = @CurrentCSId;
        SET @CMCreatedAt = DATEADD(MINUTE, (@MsgCount * 5), @CSCreatedAt2);
        
        IF NOT EXISTS (SELECT * FROM [dbo].[chat_messages] WHERE [id] = @CMId)
        BEGIN
            INSERT INTO [dbo].[chat_messages] (
                [id], [sessionId], [senderType], [senderId], 
                [content], [messageType], [isRead], [readAt], [createdAt]
            ) VALUES (
                @CMId,
                @CurrentCSId,
                @CMSenderType,
                @CMSenderId,
                @CMContent,
                N'TEXT',
                @CMIsRead,
                CASE WHEN @CMIsRead = 1 THEN DATEADD(MINUTE, 10, @CMCreatedAt) ELSE NULL END,
                @CMCreatedAt
            );
        END
        SET @ChatMsgCounter = @ChatMsgCounter + 1;
        SET @MsgCount = @MsgCount + 1;
    END
    SET @CurrentCSId = @CurrentCSId + 1;
END
SET IDENTITY_INSERT [dbo].[chat_messages] OFF;

PRINT 'Successfully inserted chat sessions and messages!';
GO

-- =============================================================
-- Step 16: Insert 30 Inventory Reservations
-- =============================================================
PRINT 'Inserting 30 inventory reservations...';
GO

DECLARE @IRCounter INT = (SELECT ISNULL(MAX([id]), 0) FROM [dbo].[inventory_reservations]) + 1;
SET IDENTITY_INSERT [dbo].[inventory_reservations] ON;

DECLARE @IRCount INT = 1;
WHILE @IRCount <= 30
BEGIN
    DECLARE @IRId INT = @IRCounter + @IRCount - 1;
    DECLARE @IRProductId INT;
    DECLARE @IRQuantity INT;
    DECLARE @IRExpiresAt DATETIME;
    
    -- Pick product
    SELECT TOP 1 @IRProductId = [id] FROM [dbo].[products] ORDER BY NEWID();
    
    -- Quantity
    SET @IRQuantity = FLOOR(1 + RAND() * 5);
    
    -- Expires (in next 48 hours)
    SET @IRExpiresAt = DATEADD(HOUR, (1 + FLOOR(RAND() * 48)), GETDATE());
    
    IF NOT EXISTS (SELECT * FROM [dbo].[inventory_reservations] WHERE [id] = @IRId)
    BEGIN
        INSERT INTO [dbo].[inventory_reservations] (
            [id], [productId], [quantity], [expiresAt], [createdAt]
        ) VALUES (
            @IRId,
            @IRProductId,
            @IRQuantity,
            @IRExpiresAt,
            GETDATE()
        );
    END
    SET @IRCount = @IRCount + 1;
END
SET IDENTITY_INSERT [dbo].[inventory_reservations] OFF;
PRINT 'Successfully inserted 30 inventory reservations!';
GO

-- =============================================================
-- Done!
-- =============================================================
PRINT '=';
PRINT 'All 30 sample records inserted successfully!';
PRINT '=';

-- Verify counts
PRINT '--- Final Counts ---';
SELECT 'Users' AS [Table], COUNT(*) AS [Count] FROM [dbo].[users]
UNION ALL SELECT 'Orders', COUNT(*) FROM [dbo].[orders]
UNION ALL SELECT 'Reviews', COUNT(*) FROM [dbo].[reviews]
UNION ALL SELECT 'Products', COUNT(*) FROM [dbo].[products]
UNION ALL SELECT 'Vouchers', COUNT(*) FROM [dbo].[vouchers]
UNION ALL SELECT 'Banners', COUNT(*) FROM [dbo].[banners]
UNION ALL SELECT 'Notifications', COUNT(*) FROM [dbo].[notifications]
UNION ALL SELECT 'Chat Sessions', COUNT(*) FROM [dbo].[chat_sessions]
UNION ALL SELECT 'Chat Messages', COUNT(*) FROM [dbo].[chat_messages]
ORDER BY [Table];
GO
