-- =============================================================
-- VIXXY D'ORANCE - Database Schema for SQL Server
-- =============================================================

-- Drop existing database (uncomment if you want to reset completely)
-- WARNING: This will delete all data!
-- IF EXISTS (SELECT * FROM sys.databases WHERE name = 'vixxy_dorance')
-- BEGIN
--     ALTER DATABASE vixxy_dorance SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
--     DROP DATABASE vixxy_dorance;
-- END
-- GO

-- Create database if not exists
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'vixxy_dorance')
BEGIN
    CREATE DATABASE vixxy_dorance
    COLLATE SQL_Latin1_General_CP1_CI_AS; -- Vietnamese-friendly collation
END
GO

USE vixxy_dorance;
GO

-- Drop all existing tables (to reset)
-- WARNING: This will delete all data!
DECLARE @sql NVARCHAR(MAX) = '';
SELECT @sql += 'DROP TABLE IF EXISTS ' + QUOTENAME(SCHEMA_NAME(schema_id)) + '.' + QUOTENAME(name) + ';'
FROM sys.tables
ORDER BY create_date DESC;

EXEC sp_executesql @sql;
GO

-- =============================================================
-- Table: Roles
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[roles]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[roles] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [roleName] NVARCHAR(50) NOT NULL UNIQUE,
        [description] NVARCHAR(MAX),
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE()
    );
END
GO

-- Insert default roles
IF NOT EXISTS (SELECT * FROM [dbo].[roles] WHERE [roleName] = 'admin')
BEGIN
    INSERT INTO [dbo].[roles] ([roleName], [description])
    VALUES 
    (N'admin', N'System administrator'),
    (N'customer', N'Regular customer'),
    (N'staff', N'Staff member');
END
GO

-- =============================================================
-- Table: Users
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[users] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [email] NVARCHAR(100) NOT NULL UNIQUE,
        [phone] NVARCHAR(20) UNIQUE,
        [username] NVARCHAR(50) UNIQUE,
        [passwordHash] NVARCHAR(255) NOT NULL,
        [fullName] NVARCHAR(255) NOT NULL,
        [avatar] NVARCHAR(255),
        [birthday] DATETIME,
        [gender] NVARCHAR(20) CHECK ([gender] IN (N'male', N'female', N'other')),
        [address] NVARCHAR(MAX),
        [status] NVARCHAR(20) DEFAULT N'active' CHECK ([status] IN (N'active', N'inactive', N'banned')),
        [emailVerified] BIT DEFAULT 0,
        [phoneVerified] BIT DEFAULT 0,
        [failedLoginAttempts] INT DEFAULT 0,
        [lockedAt] DATETIME,
        [lockoutExpiresAt] DATETIME,
        [lastLoginAt] DATETIME,
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE()
    );
END
GO

-- =============================================================
-- Table: Permissions
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[permissions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[permissions] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [permissionCode] NVARCHAR(100) NOT NULL UNIQUE,
        [permissionName] NVARCHAR(255) NOT NULL,
        [description] NVARCHAR(MAX),
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE()
    );
END
GO

-- =============================================================
-- Table: User_Roles (Many-to-Many)
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[user_roles]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[user_roles] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [userId] INT NOT NULL,
        [roleId] INT NOT NULL,
        [createdAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_user_roles_user] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION,
        CONSTRAINT [fk_user_roles_role] FOREIGN KEY ([roleId]) REFERENCES [dbo].[roles]([id]) ON DELETE NO ACTION,
        CONSTRAINT [uk_user_role] UNIQUE ([userId], [roleId])
    );
    
    -- Create indexes
    CREATE INDEX [idx_user_roles_user] ON [dbo].[user_roles]([userId]);
    CREATE INDEX [idx_user_roles_role] ON [dbo].[user_roles]([roleId]);
END
GO

-- =============================================================
-- Table: Role_Permissions (Many-to-Many)
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[role_permissions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[role_permissions] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [roleId] INT NOT NULL,
        [permissionId] INT NOT NULL,
        [createdAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_role_permissions_role] FOREIGN KEY ([roleId]) REFERENCES [dbo].[roles]([id]) ON DELETE NO ACTION,
        CONSTRAINT [fk_role_permissions_permission] FOREIGN KEY ([permissionId]) REFERENCES [dbo].[permissions]([id]) ON DELETE NO ACTION,
        CONSTRAINT [uk_role_permission] UNIQUE ([roleId], [permissionId])
    );
    
    -- Create indexes
    CREATE INDEX [idx_role_permissions_role] ON [dbo].[role_permissions]([roleId]);
    CREATE INDEX [idx_role_permissions_permission] ON [dbo].[role_permissions]([permissionId]);
END
GO

-- =============================================================
-- Table: Refresh_Tokens
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[refresh_tokens]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[refresh_tokens] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [userId] INT NOT NULL,
        [token] NVARCHAR(255) NOT NULL UNIQUE,
        [expiresAt] DATETIME NOT NULL,
        [revoked] BIT DEFAULT 0,
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_refresh_tokens_user] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION
    );
    
    -- Create indexes
    CREATE INDEX [idx_refresh_token] ON [dbo].[refresh_tokens]([token]);
    CREATE INDEX [idx_refresh_user] ON [dbo].[refresh_tokens]([userId]);
    CREATE INDEX [idx_refresh_expires] ON [dbo].[refresh_tokens]([expiresAt]);
END
GO

-- =============================================================
-- Table: Reset_Tokens
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[reset_tokens]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[reset_tokens] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [userId] INT NOT NULL,
        [token] NVARCHAR(255) NOT NULL UNIQUE,
        [expiresAt] DATETIME NOT NULL,
        [used] BIT DEFAULT 0,
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_reset_tokens_user] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION
    );
    
    -- Create indexes
    CREATE INDEX [idx_reset_token] ON [dbo].[reset_tokens]([token]);
    CREATE INDEX [idx_reset_user] ON [dbo].[reset_tokens]([userId]);
    CREATE INDEX [idx_reset_expires] ON [dbo].[reset_tokens]([expiresAt]);
END
GO

-- =============================================================
-- Table: Login_History
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[login_history]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[login_history] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [userId] INT,
        [ipAddress] NVARCHAR(50),
        [deviceInfo] NVARCHAR(MAX),
        [browserInfo] NVARCHAR(MAX),
        [loginAt] DATETIME DEFAULT GETDATE(),
        [success] BIT DEFAULT 1,
        [failureReason] NVARCHAR(255),
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_login_history_user] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE SET NULL
    );
    
    -- Create indexes
    CREATE INDEX [idx_login_user] ON [dbo].[login_history]([userId]);
    CREATE INDEX [idx_login_time] ON [dbo].[login_history]([loginAt]);
    CREATE INDEX [idx_login_success] ON [dbo].[login_history]([success]);
END
GO

-- =============================================================
-- Table: Audit_Logs
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[audit_logs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[audit_logs] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [userId] INT,
        [action] NVARCHAR(255) NOT NULL,
        [resource] NVARCHAR(255),
        [resourceId] INT,
        [oldValue] NVARCHAR(MAX),
        [newValue] NVARCHAR(MAX),
        [ipAddress] NVARCHAR(50),
        [userAgent] NVARCHAR(MAX),
        [createdAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_audit_logs_user] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE SET NULL
    );
    
    -- Create indexes
    CREATE INDEX [idx_audit_user] ON [dbo].[audit_logs]([userId]);
    CREATE INDEX [idx_audit_action] ON [dbo].[audit_logs]([action]);
    CREATE INDEX [idx_audit_time] ON [dbo].[audit_logs]([createdAt]);
END
GO

-- =============================================================
-- Table: Categories
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[categories]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[categories] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [name] NVARCHAR(100) NOT NULL,
        [slug] NVARCHAR(100) NOT NULL UNIQUE,
        [description] NVARCHAR(MAX),
        [imageUrl] NVARCHAR(255),
        [parentId] INT,
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_categories_parent] FOREIGN KEY ([parentId]) REFERENCES [dbo].[categories]([id]) ON DELETE NO ACTION
    );
    
    -- Create indexes
    CREATE INDEX [idx_categories_slug] ON [dbo].[categories]([slug]);
END
GO

-- =============================================================
-- Table: Products
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[products]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[products] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [name] NVARCHAR(255) NOT NULL,
        [slug] NVARCHAR(255) NOT NULL UNIQUE,
        [description] NVARCHAR(MAX),
        [shortDescription] NVARCHAR(500),
        [sku] NVARCHAR(50) NOT NULL UNIQUE,
        [price] DECIMAL(12,2) NOT NULL,
        [discountPrice] DECIMAL(12,2),
        [stockQuantity] INT NOT NULL DEFAULT 0,
        [isActive] BIT DEFAULT 1,
        [isFeatured] BIT DEFAULT 0,
        [viewCount] INT DEFAULT 0,
        [saleCount] INT DEFAULT 0,
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE()
    );
    
    -- Create indexes
    CREATE INDEX [idx_products_slug] ON [dbo].[products]([slug]);
    CREATE INDEX [idx_products_sku] ON [dbo].[products]([sku]);
    CREATE INDEX [idx_products_price] ON [dbo].[products]([price]);
    CREATE INDEX [idx_products_is_active] ON [dbo].[products]([isActive]);
END
GO

-- =============================================================
-- Table: Product_Categories (Many-to-Many)
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[product_categories]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[product_categories] (
        [productId] INT NOT NULL,
        [categoryId] INT NOT NULL,
        [createdAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [pk_product_categories] PRIMARY KEY ([productId], [categoryId]),
        CONSTRAINT [fk_product_categories_product] FOREIGN KEY ([productId]) REFERENCES [dbo].[products]([id]) ON DELETE NO ACTION,
        CONSTRAINT [fk_product_categories_category] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[categories]([id]) ON DELETE NO ACTION
    );
END
GO

-- =============================================================
-- Table: Product_Images
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[product_images]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[product_images] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [productId] INT NOT NULL,
        [imageUrl] NVARCHAR(255) NOT NULL,
        [altText] NVARCHAR(255),
        [isPrimary] BIT DEFAULT 0,
        [sortOrder] INT DEFAULT 0,
        [createdAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_product_images_product] FOREIGN KEY ([productId]) REFERENCES [dbo].[products]([id]) ON DELETE NO ACTION
    );
    
    -- Create index
    CREATE INDEX [idx_product_images_product] ON [dbo].[product_images]([productId]);
END
GO

-- =============================================================
-- Table: Product_Variants (Sizes & Colors)
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[product_variants]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[product_variants] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [productId] INT NOT NULL,
        [size] NVARCHAR(20), -- S, M, L, XL, etc.
        [color] NVARCHAR(50), -- Red, Blue, etc.
        [sku] NVARCHAR(50) UNIQUE,
        [stockQuantity] INT DEFAULT 0,
        [price] DECIMAL(12,2),
        [imageUrl] NVARCHAR(255),
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_product_variants_product] FOREIGN KEY ([productId]) REFERENCES [dbo].[products]([id]) ON DELETE NO ACTION
    );
    
    -- Create indexes
    CREATE INDEX [idx_product_variants_product] ON [dbo].[product_variants]([productId]);
END
GO

-- =============================================================
-- Table: Inventory_Reservations
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[inventory_reservations]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[inventory_reservations] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [productId] INT NOT NULL,
        [quantity] INT NOT NULL,
        [expiresAt] DATETIME NOT NULL,
        [createdAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_inventory_reservations_product] FOREIGN KEY ([productId]) REFERENCES [dbo].[products]([id]) ON DELETE NO ACTION
    );
END
GO

-- =============================================================
-- Table: Wishlists
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[wishlists]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[wishlists] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [userId] INT NOT NULL UNIQUE,
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_wishlists_user] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION
    );
    
    -- Create index
    CREATE INDEX [idx_wishlists_user] ON [dbo].[wishlists]([userId]);
END
GO

-- =============================================================
-- Table: Wishlist_Items
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[wishlist_items]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[wishlist_items] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [wishlistId] INT NOT NULL,
        [productId] INT NOT NULL,
        [createdAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_wishlist_items_wishlist] FOREIGN KEY ([wishlistId]) REFERENCES [dbo].[wishlists]([id]) ON DELETE NO ACTION,
        CONSTRAINT [fk_wishlist_items_product] FOREIGN KEY ([productId]) REFERENCES [dbo].[products]([id]) ON DELETE NO ACTION,
        CONSTRAINT [uk_wishlist_product] UNIQUE ([wishlistId], [productId])
    );
    
    -- Create indexes
    CREATE INDEX [idx_wishlist_items_wishlist] ON [dbo].[wishlist_items]([wishlistId]);
    CREATE INDEX [idx_wishlist_items_product] ON [dbo].[wishlist_items]([productId]);
END
GO

-- =============================================================
-- Table: Carts
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[carts]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[carts] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [userId] INT NOT NULL UNIQUE,
        [totalAmount] DECIMAL(12,2) DEFAULT 0,
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_carts_user] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION
    );
    
    -- Create index
    CREATE INDEX [idx_carts_user] ON [dbo].[carts]([userId]);
END
GO

-- =============================================================
-- Table: Cart_Items
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[cart_items]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[cart_items] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [cartId] INT NOT NULL,
        [productId] INT NOT NULL,
        [quantity] INT NOT NULL DEFAULT 1,
        [price] DECIMAL(12,2) NOT NULL,
        [size] NVARCHAR(20),
        [color] NVARCHAR(50),
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_cart_items_cart] FOREIGN KEY ([cartId]) REFERENCES [dbo].[carts]([id]) ON DELETE NO ACTION,
        CONSTRAINT [fk_cart_items_product] FOREIGN KEY ([productId]) REFERENCES [dbo].[products]([id]) ON DELETE NO ACTION
    );
    
    -- Create indexes
    CREATE INDEX [idx_cart_items_cart] ON [dbo].[cart_items]([cartId]);
    CREATE INDEX [idx_cart_items_product] ON [dbo].[cart_items]([productId]);
END
GO

-- =============================================================
-- Table: Vouchers
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[vouchers]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[vouchers] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [code] NVARCHAR(50) NOT NULL UNIQUE,
        [discountType] NVARCHAR(20) NOT NULL CHECK ([discountType] IN (N'percent', N'fixed')),
        [discountValue] DECIMAL(12,2) NOT NULL,
        [minOrderValue] DECIMAL(12,2) DEFAULT 0,
        [maxUsage] INT,
        [usedCount] INT DEFAULT 0,
        [startDate] DATETIME NOT NULL,
        [endDate] DATETIME NOT NULL,
        [isActive] BIT DEFAULT 1,
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE()
    );
END
GO

-- =============================================================
-- Table: Addresses
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[addresses]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[addresses] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [userId] INT NOT NULL,
        [fullName] NVARCHAR(255) NOT NULL,
        [phone] NVARCHAR(20) NOT NULL,
        [addressLine1] NVARCHAR(MAX) NOT NULL,
        [addressLine2] NVARCHAR(MAX),
        [city] NVARCHAR(100) NOT NULL,
        [district] NVARCHAR(100),
        [ward] NVARCHAR(100),
        [postalCode] NVARCHAR(20),
        [isDefault] BIT DEFAULT 0,
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_addresses_user] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION
    );
    
    -- Create indexes
    CREATE INDEX [idx_addresses_user] ON [dbo].[addresses]([userId]);
END
GO

-- =============================================================
-- Table: Orders
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[orders]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[orders] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [userId] INT NOT NULL,
        [orderNumber] NVARCHAR(50) NOT NULL UNIQUE,
        [orderStatus] NVARCHAR(50) NOT NULL DEFAULT N'PENDING', -- PENDING, PROCESSING, SHIPPING, DELIVERED, CANCELLED, REFUND_PENDING, REFUNDED, REFUND_REJECTED
        [totalAmount] DECIMAL(12,2) NOT NULL,
        [shippingFee] DECIMAL(12,2) DEFAULT 0,
        [taxAmount] DECIMAL(12,2) DEFAULT 0,
        [discountAmount] DECIMAL(12,2) DEFAULT 0,
        [shippingAddress] NVARCHAR(MAX) NOT NULL, -- JSON string
        [paymentMethod] NVARCHAR(50), -- COD, MOMO, ZALOPAY, SEPAY, QR_DEMO
        [paymentStatus] NVARCHAR(50) DEFAULT N'UNPAID', -- UNPAID, PENDING, PAID, FAILED, REFUNDED
        [notes] NVARCHAR(MAX),
        [paidAt] DATETIME,
        [shippedAt] DATETIME,
        [deliveredAt] DATETIME,
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_orders_user] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION
    );
    
    -- Create indexes
    CREATE INDEX [idx_orders_order_number] ON [dbo].[orders]([orderNumber]);
    CREATE INDEX [idx_orders_user] ON [dbo].[orders]([userId]);
    CREATE INDEX [idx_orders_status] ON [dbo].[orders]([orderStatus]);
END
GO

-- =============================================================
-- Table: Order_Details
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[order_details]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[order_details] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [orderId] INT NOT NULL,
        [productId] INT,
        [productName] NVARCHAR(255) NOT NULL,
        [productSku] NVARCHAR(50) NOT NULL,
        [productImage] NVARCHAR(255),
        [quantity] INT NOT NULL,
        [price] DECIMAL(12,2) NOT NULL,
        [size] NVARCHAR(20),
        [color] NVARCHAR(50),
        [createdAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_order_details_order] FOREIGN KEY ([orderId]) REFERENCES [dbo].[orders]([id]) ON DELETE NO ACTION,
        CONSTRAINT [fk_order_details_product] FOREIGN KEY ([productId]) REFERENCES [dbo].[products]([id]) ON DELETE SET NULL
    );
    
    -- Create index
    CREATE INDEX [idx_order_details_order] ON [dbo].[order_details]([orderId]);
END
GO

-- =============================================================
-- Table: Order_Vouchers
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[order_vouchers]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[order_vouchers] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [orderId] INT NOT NULL,
        [voucherId] INT NOT NULL,
        [createdAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_order_vouchers_order] FOREIGN KEY ([orderId]) REFERENCES [dbo].[orders]([id]) ON DELETE NO ACTION,
        CONSTRAINT [fk_order_vouchers_voucher] FOREIGN KEY ([voucherId]) REFERENCES [dbo].[vouchers]([id]) ON DELETE NO ACTION
    );
END
GO

-- =============================================================
-- Table: Payments
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[payments]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[payments] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [orderId] INT NOT NULL,
        [paymentMethod] NVARCHAR(50) NOT NULL,
        [amount] DECIMAL(12,2) NOT NULL,
        [transactionId] NVARCHAR(255) NOT NULL UNIQUE,
        [paymentStatus] NVARCHAR(50) NOT NULL DEFAULT N'PENDING', -- PENDING, PAID, FAILED, REFUNDED
        [paidAt] DATETIME,
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_payments_order] FOREIGN KEY ([orderId]) REFERENCES [dbo].[orders]([id]) ON DELETE NO ACTION
    );
    
    -- Create indexes
    CREATE INDEX [idx_payments_order] ON [dbo].[payments]([orderId]);
    CREATE INDEX [idx_payments_transaction] ON [dbo].[payments]([transactionId]);
    CREATE INDEX [idx_payments_status] ON [dbo].[payments]([paymentStatus]);
END
GO

-- =============================================================
-- Table: Payment_Logs
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[payment_logs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[payment_logs] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [paymentId] INT NOT NULL,
        [requestData] NVARCHAR(MAX), -- JSON string
        [responseData] NVARCHAR(MAX), -- JSON string
        [logType] NVARCHAR(100) NOT NULL, -- CREATE_QR, PAYMENT_SUCCESS, etc.
        [createdAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_payment_logs_payment] FOREIGN KEY ([paymentId]) REFERENCES [dbo].[payments]([id]) ON DELETE NO ACTION
    );
    
    -- Create indexes
    CREATE INDEX [idx_payment_logs_payment] ON [dbo].[payment_logs]([paymentId]);
    CREATE INDEX [idx_payment_logs_type] ON [dbo].[payment_logs]([logType]);
END
GO

-- =============================================================
-- Table: Payment_Gateways
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[payment_gateways]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[payment_gateways] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [name] NVARCHAR(100) NOT NULL,
        [code] NVARCHAR(50) NOT NULL UNIQUE,
        [config] NVARCHAR(MAX), -- JSON string for gateway credentials/configs
        [isActive] BIT DEFAULT 1,
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE()
    );
END
GO

-- =============================================================
-- Table: Refund_Requests
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[refund_requests]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[refund_requests] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [orderId] INT NOT NULL,
        [reason] NVARCHAR(MAX) NOT NULL,
        [status] NVARCHAR(50) DEFAULT N'PENDING', -- PENDING, APPROVED, REJECTED
        [requestedAt] DATETIME DEFAULT GETDATE(),
        [resolvedAt] DATETIME,
        [resolutionNote] NVARCHAR(MAX),
        CONSTRAINT [fk_refund_requests_order] FOREIGN KEY ([orderId]) REFERENCES [dbo].[orders]([id]) ON DELETE NO ACTION
    );
END
GO

-- =============================================================
-- Table: Shippings
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[shippings]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[shippings] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [orderId] INT NOT NULL,
        [trackingCode] NVARCHAR(100),
        [shippingPartner] NVARCHAR(100),
        [shippingStatus] NVARCHAR(50) DEFAULT N'PENDING', -- PENDING, PICKED_UP, IN_TRANSIT, DELIVERED
        [estimatedDelivery] DATETIME,
        [actualDelivery] DATETIME,
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_shippings_order] FOREIGN KEY ([orderId]) REFERENCES [dbo].[orders]([id]) ON DELETE NO ACTION
    );
END
GO

-- =============================================================
-- Table: Reviews
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[reviews]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[reviews] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [productId] INT NOT NULL,
        [userId] INT NOT NULL,
        [rating] INT NOT NULL CHECK ([rating] BETWEEN 1 AND 5),
        [title] NVARCHAR(255),
        [comment] NVARCHAR(MAX),
        [images] NVARCHAR(MAX), -- JSON array of image URLs
        [videoUrl] NVARCHAR(255),
        [size] NVARCHAR(20),
        [color] NVARCHAR(50),
        [city] NVARCHAR(100),
        [likesCount] INT DEFAULT 0,
        [helpfulCount] INT DEFAULT 0,
        [hasPurchased] BIT DEFAULT 1,
        [reply] NVARCHAR(MAX),
        [repliedAt] DATETIME,
        [status] NVARCHAR(20) DEFAULT N'APPROVED', -- PENDING, APPROVED, HIDDEN
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_reviews_product] FOREIGN KEY ([productId]) REFERENCES [dbo].[products]([id]) ON DELETE NO ACTION,
        CONSTRAINT [fk_reviews_user] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION
    );
    
    -- Create indexes
    CREATE INDEX [idx_reviews_product] ON [dbo].[reviews]([productId]);
    CREATE INDEX [idx_reviews_user] ON [dbo].[reviews]([userId]);
    CREATE INDEX [idx_reviews_rating] ON [dbo].[reviews]([rating]);
END
GO

-- =============================================================
-- Table: Banners
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[banners]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[banners] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [title] NVARCHAR(255),
        [subtitle] NVARCHAR(255),
        [imageUrl] NVARCHAR(255) NOT NULL,
        [linkUrl] NVARCHAR(255),
        [isActive] BIT DEFAULT 1,
        [sortOrder] INT DEFAULT 0,
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE()
    );
END
GO

-- =============================================================
-- Table: Notifications
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[notifications]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[notifications] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [userId] INT NOT NULL,
        [type] NVARCHAR(50) NOT NULL, -- ORDER, REVIEW, PROMOTION, etc.
        [title] NVARCHAR(255) NOT NULL,
        [message] NVARCHAR(MAX) NOT NULL,
        [data] NVARCHAR(MAX), -- JSON string for additional data
        [isRead] BIT DEFAULT 0,
        [readAt] DATETIME,
        [createdAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_notifications_user] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION
    );
    
    -- Create indexes
    CREATE INDEX [idx_notifications_user] ON [dbo].[notifications]([userId]);
    CREATE INDEX [idx_notifications_is_read] ON [dbo].[notifications]([isRead]);
END
GO

-- =============================================================
-- Table: Loyalty_Points
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[loyalty_points]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[loyalty_points] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [userId] INT NOT NULL,
        [points] INT NOT NULL,
        [type] NVARCHAR(20) NOT NULL, -- EARN, REDEEM
        [description] NVARCHAR(255),
        [orderId] INT,
        [createdAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_loyalty_points_user] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION,
        CONSTRAINT [fk_loyalty_points_order] FOREIGN KEY ([orderId]) REFERENCES [dbo].[orders]([id]) ON DELETE SET NULL
    );
    
    -- Create indexes
    CREATE INDEX [idx_loyalty_points_user] ON [dbo].[loyalty_points]([userId]);
END
GO

-- =============================================================
-- Table: User_Activities
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[user_activities]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[user_activities] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [userId] INT NOT NULL,
        [activityType] NVARCHAR(50) NOT NULL, -- VIEW_PRODUCT, ADD_TO_CART, PURCHASE, etc.
        [productId] INT,
        [orderId] INT,
        [details] NVARCHAR(MAX),
        [createdAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_user_activities_user] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION,
        CONSTRAINT [fk_user_activities_product] FOREIGN KEY ([productId]) REFERENCES [dbo].[products]([id]) ON DELETE SET NULL,
        CONSTRAINT [fk_user_activities_order] FOREIGN KEY ([orderId]) REFERENCES [dbo].[orders]([id]) ON DELETE SET NULL
    );
    
    -- Create indexes
    CREATE INDEX [idx_user_activities_user] ON [dbo].[user_activities]([userId]);
    CREATE INDEX [idx_user_activities_type] ON [dbo].[user_activities]([activityType]);
END
GO

-- =============================================================
-- Table: Posts
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[posts]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[posts] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [title] NVARCHAR(255) NOT NULL,
        [slug] NVARCHAR(255) NOT NULL UNIQUE,
        [content] NVARCHAR(MAX) NOT NULL,
        [excerpt] NVARCHAR(500),
        [featuredImage] NVARCHAR(255),
        [authorId] INT NOT NULL,
        [status] NVARCHAR(20) DEFAULT N'PUBLIC', -- PUBLIC, PRIVATE
        [postType] NVARCHAR(20) DEFAULT N'USER', -- USER, GROUP
        [viewCount] INT DEFAULT 0,
        [likeCount] INT DEFAULT 0,
        [commentCount] INT DEFAULT 0,
        [shareCount] INT DEFAULT 0,
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_posts_author] FOREIGN KEY ([authorId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION
    );
    
    -- Create indexes
    CREATE INDEX [idx_posts_slug] ON [dbo].[posts]([slug]);
    CREATE INDEX [idx_posts_author] ON [dbo].[posts]([authorId]);
END
GO

-- =============================================================
-- Table: Post_Comments
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[post_comments]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[post_comments] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [postId] INT NOT NULL,
        [userId] INT NOT NULL,
        [parentId] INT, -- For replies
        [content] NVARCHAR(MAX) NOT NULL,
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_post_comments_post] FOREIGN KEY ([postId]) REFERENCES [dbo].[posts]([id]) ON DELETE NO ACTION,
        CONSTRAINT [fk_post_comments_user] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION,
        CONSTRAINT [fk_post_comments_parent] FOREIGN KEY ([parentId]) REFERENCES [dbo].[post_comments]([id]) ON DELETE NO ACTION
    );
END
GO

-- =============================================================
-- Table: Post_Likes
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[post_likes]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[post_likes] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [postId] INT NOT NULL,
        [userId] INT NOT NULL,
        [createdAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_post_likes_post] FOREIGN KEY ([postId]) REFERENCES [dbo].[posts]([id]) ON DELETE NO ACTION,
        CONSTRAINT [fk_post_likes_user] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION,
        CONSTRAINT [uk_post_like] UNIQUE ([postId], [userId])
    );
END
GO

-- =============================================================
-- Table: Post_Shares
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[post_shares]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[post_shares] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [postId] INT NOT NULL,
        [userId] INT,
        [platform] NVARCHAR(50), -- Facebook, Twitter, etc.
        [createdAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_post_shares_post] FOREIGN KEY ([postId]) REFERENCES [dbo].[posts]([id]) ON DELETE NO ACTION,
        CONSTRAINT [fk_post_shares_user] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE SET NULL
    );
END
GO

-- =============================================================
-- Table: Post_Views
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[post_views]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[post_views] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [postId] INT NOT NULL,
        [userId] INT,
        [ipAddress] NVARCHAR(50),
        [viewedAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_post_views_post] FOREIGN KEY ([postId]) REFERENCES [dbo].[posts]([id]) ON DELETE NO ACTION,
        CONSTRAINT [fk_post_views_user] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE SET NULL
    );
END
GO

-- =============================================================
-- Table: Chat_Sessions
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[chat_sessions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[chat_sessions] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [customerId] INT NOT NULL,
        [staffId] INT,
        [status] NVARCHAR(50) DEFAULT N'OPEN', -- OPEN, CLOSED, PENDING, TRANSFERRED
        [priority] NVARCHAR(20) DEFAULT N'MEDIUM', -- LOW, MEDIUM, HIGH
        [subject] NVARCHAR(255),
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_chat_sessions_customer] FOREIGN KEY ([customerId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION,
        CONSTRAINT [fk_chat_sessions_staff] FOREIGN KEY ([staffId]) REFERENCES [dbo].[users]([id]) ON DELETE SET NULL
    );
END
GO

-- =============================================================
-- Table: Chat_Messages
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[chat_messages]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[chat_messages] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [sessionId] INT NOT NULL,
        [senderType] NVARCHAR(20) NOT NULL, -- USER, STAFF, BOT
        [senderId] INT NOT NULL,
        [content] NVARCHAR(MAX) NOT NULL,
        [messageType] NVARCHAR(20) DEFAULT N'TEXT', -- TEXT, IMAGE, FILE, etc.
        [isRead] BIT DEFAULT 0,
        [readAt] DATETIME,
        [createdAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_chat_messages_session] FOREIGN KEY ([sessionId]) REFERENCES [dbo].[chat_sessions]([id]) ON DELETE NO ACTION
    );
END
GO

-- =============================================================
-- Table: Chat_Attachments
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[chat_attachments]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[chat_attachments] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [messageId] INT NOT NULL,
        [fileName] NVARCHAR(255) NOT NULL,
        [fileUrl] NVARCHAR(255) NOT NULL,
        [fileType] NVARCHAR(50),
        [fileSize] BIGINT,
        [createdAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_chat_attachments_message] FOREIGN KEY ([messageId]) REFERENCES [dbo].[chat_messages]([id]) ON DELETE NO ACTION
    );
END
GO

-- =============================================================
-- Table: Chat_Queue
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[chat_queue]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[chat_queue] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [sessionId] INT NOT NULL,
        [position] INT NOT NULL,
        [joinedAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_chat_queue_session] FOREIGN KEY ([sessionId]) REFERENCES [dbo].[chat_sessions]([id]) ON DELETE NO ACTION
    );
END
GO

-- =============================================================
-- Table: Chat_Transfers
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[chat_transfers]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[chat_transfers] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [sessionId] INT NOT NULL,
        [fromStaffId] INT,
        [toStaffId] INT,
        [reason] NVARCHAR(MAX),
        [transferredAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_chat_transfers_session] FOREIGN KEY ([sessionId]) REFERENCES [dbo].[chat_sessions]([id]) ON DELETE NO ACTION,
        CONSTRAINT [fk_chat_transfers_from] FOREIGN KEY ([fromStaffId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION,
        CONSTRAINT [fk_chat_transfers_to] FOREIGN KEY ([toStaffId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION
    );
END
GO

-- =============================================================
-- Table: Chatbot_Knowledge
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[chatbot_knowledge]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[chatbot_knowledge] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [categoryId] INT,
        [question] NVARCHAR(MAX) NOT NULL,
        [answer] NVARCHAR(MAX) NOT NULL,
        [keywords] NVARCHAR(MAX), -- JSON array
        [isActive] BIT DEFAULT 1,
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE()
    );
END
GO

-- =============================================================
-- Table: Chatbot_Prompts
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[chatbot_prompts]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[chatbot_prompts] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [name] NVARCHAR(255) NOT NULL,
        [prompt] NVARCHAR(MAX) NOT NULL,
        [isActive] BIT DEFAULT 1,
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE()
    );
END
GO

-- =============================================================
-- Table: AI_Knowledge_Categories
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ai_knowledge_categories]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ai_knowledge_categories] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [name] NVARCHAR(255) NOT NULL,
        [description] NVARCHAR(MAX),
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE()
    );
END
GO

-- =============================================================
-- Table: AI_Knowledge
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ai_knowledge]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ai_knowledge] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [categoryId] INT,
        [title] NVARCHAR(255) NOT NULL,
        [content] NVARCHAR(MAX) NOT NULL,
        [source] NVARCHAR(255),
        [isActive] BIT DEFAULT 1,
        [createdAt] DATETIME DEFAULT GETDATE(),
        [updatedAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_ai_knowledge_category] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[ai_knowledge_categories]([id]) ON DELETE SET NULL
    );
END
GO

-- =============================================================
-- Table: AI_Embeddings
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ai_embeddings]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ai_embeddings] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [knowledgeId] INT NOT NULL,
        [embedding] VARBINARY(MAX) NOT NULL, -- Storing embedding as binary
        [chunkIndex] INT,
        [createdAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_ai_embeddings_knowledge] FOREIGN KEY ([knowledgeId]) REFERENCES [dbo].[ai_knowledge]([id]) ON DELETE NO ACTION
    );
END
GO

-- =============================================================
-- Table: AI_Knowledge_Search_Logs
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ai_knowledge_search_logs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ai_knowledge_search_logs] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [query] NVARCHAR(MAX) NOT NULL,
        [results] NVARCHAR(MAX), -- JSON array of result IDs
        [userId] INT,
        [createdAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_ai_knowledge_search_logs_user] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE SET NULL
    );
END
GO

-- =============================================================
-- Table: AI_Sales_Sessions
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ai_sales_sessions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ai_sales_sessions] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [userId] INT,
        [context] NVARCHAR(MAX), -- JSON string of conversation context
        [status] NVARCHAR(20) DEFAULT N'ACTIVE', -- ACTIVE, ENDED
        [startedAt] DATETIME DEFAULT GETDATE(),
        [endedAt] DATETIME,
        CONSTRAINT [fk_ai_sales_sessions_user] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE SET NULL
    );
END
GO

-- =============================================================
-- Table: AI_Action_Logs
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ai_action_logs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ai_action_logs] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [sessionId] INT NOT NULL,
        [action] NVARCHAR(255) NOT NULL,
        [input] NVARCHAR(MAX),
        [output] NVARCHAR(MAX),
        [createdAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_ai_action_logs_session] FOREIGN KEY ([sessionId]) REFERENCES [dbo].[ai_sales_sessions]([id]) ON DELETE NO ACTION
    );
END
GO

-- =============================================================
-- Table: AI_Recommendation_Logs
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ai_recommendation_logs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ai_recommendation_logs] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [userId] INT,
        [productIds] NVARCHAR(MAX), -- JSON array of product IDs
        [context] NVARCHAR(MAX),
        [createdAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_ai_recommendation_logs_user] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE SET NULL
    );
END
GO

-- =============================================================
-- Table: AI_Usage_Logs
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ai_usage_logs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ai_usage_logs] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [userId] INT,
        [feature] NVARCHAR(100) NOT NULL,
        [tokensUsed] INT,
        [cost] DECIMAL(10,4),
        [createdAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [fk_ai_usage_logs_user] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE SET NULL
    );
END
GO

PRINT 'Database schema created successfully!';
GO

-- =============================================================
-- =============================================================
-- SAMPLE DATA INSERTION
-- =============================================================
-- =============================================================

-- =============================================================
-- Sample: Users (100 users with realistic Vietnamese names)
-- =============================================================
PRINT 'Inserting sample users...';
GO

-- Insert Admin User first
IF NOT EXISTS (SELECT * FROM [dbo].[users] WHERE [email] = 'admin@vixxy.com')
BEGIN
    SET IDENTITY_INSERT [dbo].[users] ON;
    INSERT INTO [dbo].[users] ([id], [email], [phone], [username], [passwordHash], [fullName], [avatar], [birthday], [gender], [address], [status], [emailVerified], [phoneVerified], [createdAt], [updatedAt])
    VALUES 
    (1, 'admin@vixxy.com', '0901234567', 'admin', '$2b$10$N9qo8uLOickvxPsW3J6Z1e6q1iXb4w6H3J6Q0J4Z7W9Z5e6X7Q9aK', N'Nguyễn Văn Admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', '1985-05-15', 'male', N'123 Đường Lê Lợi, Quận 1, TP.HCM', 'active', 1, 1, GETDATE(), GETDATE());
    SET IDENTITY_INSERT [dbo].[users] OFF;
END

-- Assign Admin Role
IF NOT EXISTS (SELECT * FROM [dbo].[user_roles] WHERE [userId] = 1 AND [roleId] = 1)
BEGIN
    INSERT INTO [dbo].[user_roles] ([userId], [roleId])
    VALUES (1, 1);
END

-- Insert Staff User
IF NOT EXISTS (SELECT * FROM [dbo].[users] WHERE [email] = 'staff@vixxy.com')
BEGIN
    SET IDENTITY_INSERT [dbo].[users] ON;
    INSERT INTO [dbo].[users] ([id], [email], [phone], [username], [passwordHash], [fullName], [avatar], [birthday], [gender], [address], [status], [emailVerified], [phoneVerified], [createdAt], [updatedAt])
    VALUES 
    (2, 'staff@vixxy.com', '0901234568', 'staff', '$2b$10$N9qo8uLOickvxPsW3J6Z1e6q1iXb4w6H3J6Q0J4Z7W9Z5e6X7Q9aK', N'Trần Thị Nhân Viên', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', '1990-08-20', 'female', N'456 Đường Nguyễn Văn Cừ, Quận 3, TP.HCM', 'active', 1, 1, GETDATE(), GETDATE());
    SET IDENTITY_INSERT [dbo].[users] OFF;
END

-- Assign Staff Role
IF NOT EXISTS (SELECT * FROM [dbo].[user_roles] WHERE [userId] = 2 AND [roleId] = 3)
BEGIN
    INSERT INTO [dbo].[user_roles] ([userId], [roleId])
    VALUES (2, 3);
END

-- Insert 98 more Customer Users
DECLARE @userCounter INT = 3;
DECLARE @vietnameseLastNames NVARCHAR(MAX) = N'Nguyễn,Trần,Lê,Phạm,Hoàng,Nguyễn,Vũ,Đặng,Đỗ,Hồ,Ngô,Dương,Lý';
DECLARE @vietnameseMiddleNames NVARCHAR(MAX) = N'Văn,Thị,Thanh,Hồng,Hoài,Kim,Ngọc,Quốc,Minh,Thế,Anh,Thủy,Xuân,Hà,Phương';
DECLARE @vietnameseFirstNames NVARCHAR(MAX) = N'An,Bảo,Bình,Châu,Cường,Đạt,Đức,Dũng,Giang,Hải,Hà,Hùng,Huy,Khanh,Khoa,Kiên,Linh,Mai,Minh,Nam,Nghĩa,Ngọc,Nhi,Phong,Phúc,Quân,Quốc,Sơn,Thảo,Thu,Thúy,Trang,Trường,Tú,Tùng,Việt,Xuân,Yến';
DECLARE @cities NVARCHAR(MAX) = N'Hà Nội,Hồ Chí Minh,Đà Nẵng,Hải Phòng,Cần Thơ,Nha Trang,Vũng Tàu,Đà Lạt,Phú Quốc,Quy Nhơn';
DECLARE @avatarBaseUrls NVARCHAR(MAX) = N'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop,https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop,https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop,https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop,https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop';

WHILE @userCounter <= 100
BEGIN
    DECLARE @randomLastNameIndex INT = FLOOR(RAND() * (LEN(@vietnameseLastNames) - LEN(REPLACE(@vietnameseLastNames, ',', '')) + 1)) + 1;
    DECLARE @randomMiddleNameIndex INT = FLOOR(RAND() * (LEN(@vietnameseMiddleNames) - LEN(REPLACE(@vietnameseMiddleNames, ',', '')) + 1)) + 1;
    DECLARE @randomFirstNameIndex INT = FLOOR(RAND() * (LEN(@vietnameseFirstNames) - LEN(REPLACE(@vietnameseFirstNames, ',', '')) + 1)) + 1;
    DECLARE @randomCityIndex INT = FLOOR(RAND() * (LEN(@cities) - LEN(REPLACE(@cities, ',', '')) + 1)) + 1;
    DECLARE @randomAvatarIndex INT = FLOOR(RAND() * (LEN(@avatarBaseUrls) - LEN(REPLACE(@avatarBaseUrls, ',', '')) + 1)) + 1;
    
    -- Split strings to get random names
    DECLARE @lastName NVARCHAR(50);
    DECLARE @middleName NVARCHAR(50);
    DECLARE @firstName NVARCHAR(50);
    DECLARE @city NVARCHAR(50);
    DECLARE @avatarUrl NVARCHAR(255);
    
    -- Get random last name
    WITH LastNames AS (SELECT value AS Name, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@vietnameseLastNames, ','))
    SELECT @lastName = Name FROM LastNames WHERE RN = @randomLastNameIndex;
    
    -- Get random middle name
    WITH MiddleNames AS (SELECT value AS Name, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@vietnameseMiddleNames, ','))
    SELECT @middleName = Name FROM MiddleNames WHERE RN = @randomMiddleNameIndex;
    
    -- Get random first name
    WITH FirstNames AS (SELECT value AS Name, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@vietnameseFirstNames, ','))
    SELECT @firstName = Name FROM FirstNames WHERE RN = @randomFirstNameIndex;
    
    -- Get random city
    WITH Cities AS (SELECT value AS Name, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@cities, ','))
    SELECT @city = Name FROM Cities WHERE RN = @randomCityIndex;
    
    -- Get random avatar
    WITH Avatars AS (SELECT value AS Url, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@avatarBaseUrls, ','))
    SELECT @avatarUrl = Url FROM Avatars WHERE RN = @randomAvatarIndex;
    
    DECLARE @fullName NVARCHAR(255) = @lastName + N' ' + @middleName + N' ' + @firstName;
    DECLARE @email NVARCHAR(100) = LOWER(@lastName + @middleName + @firstName + CAST(@userCounter AS NVARCHAR(10)) + '@gmail.com');
    DECLARE @phone NVARCHAR(20) = '09' + CAST(FLOOR(10000000 + RAND() * 90000000) AS NVARCHAR(10));
    DECLARE @gender NVARCHAR(10) = IIF(RAND() > 0.5, 'male', 'female');
    DECLARE @birthday DATETIME = DATEADD(YEAR, -FLOOR(18 + RAND() * 40), GETDATE());
    
    SET IDENTITY_INSERT [dbo].[users] ON;
    INSERT INTO [dbo].[users] ([id], [email], [phone], [username], [passwordHash], [fullName], [avatar], [birthday], [gender], [address], [status], [emailVerified], [phoneVerified], [createdAt], [updatedAt])
    VALUES 
    (@userCounter, @email, @phone, LOWER(@lastName + @firstName + CAST(@userCounter AS NVARCHAR(10))), '$2b$10$N9qo8uLOickvxPsW3J6Z1e6q1iXb4w6H3J6Q0J4Z7W9Z5e6X7Q9aK', @fullName, @avatarUrl, @birthday, @gender, N'Số ' + CAST(@userCounter AS NVARCHAR(10)) + N' Đường ABC, ' + @city, 'active', 1, 1, DATEADD(DAY, -FLOOR(RAND() * 365), GETDATE()), GETDATE());
    SET IDENTITY_INSERT [dbo].[users] OFF;
    
    -- Assign Customer Role
    INSERT INTO [dbo].[user_roles] ([userId], [roleId])
    VALUES (@userCounter, 2);
    
    SET @userCounter = @userCounter + 1;
END
GO

PRINT 'Sample users inserted successfully!';
GO

-- =============================================================
-- Sample: Categories
-- =============================================================
PRINT 'Inserting sample categories...';
GO

IF NOT EXISTS (SELECT * FROM [dbo].[categories] WHERE [slug] = 'ao-so-mi')
BEGIN
    INSERT INTO [dbo].[categories] ([name], [slug], [description], [imageUrl], [createdAt], [updatedAt])
    VALUES 
    (N'Áo Sơ Mi', 'ao-so-mi', N'Áo sơ mi nam nữ thời trang', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop', GETDATE(), GETDATE()),
    (N'Áo Thun', 'ao-thun', N'Áo thun cotton mềm mại', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop', GETDATE(), GETDATE()),
    (N'Quần Jean', 'quan-jean', N'Quần jean nam nữ', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=300&fit=crop', GETDATE(), GETDATE()),
    (N'Váy', 'vay', N'Váy nữ thời trang', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=300&fit=crop', GETDATE(), GETDATE()),
    (N'Đầm', 'dam', N'Đầm công sở và dự tiệc', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=300&fit=crop', GETDATE(), GETDATE()),
    (N'Áo Khoác', 'ao-khoac', N'Áo khoác ấm áp', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop', GETDATE(), GETDATE()),
    (N'Giày Dép', 'giay-dep', N'Giày dép thời trang', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop', GETDATE(), GETDATE()),
    (N'Phụ Kiện', 'phu-kien', N'Phụ kiện thời trang', 'https://images.unsplash.com/photo-1611926648087-2693b90e4963?w=400&h=300&fit=crop', GETDATE(), GETDATE());
END
GO

PRINT 'Sample categories inserted successfully!';
GO

-- =============================================================
-- Sample: Products
-- =============================================================
PRINT 'Inserting sample products...';
GO

IF NOT EXISTS (SELECT * FROM [dbo].[products] WHERE [slug] = 'ao-so-mi-cotton-trang')
BEGIN
    SET IDENTITY_INSERT [dbo].[products] ON;
    INSERT INTO [dbo].[products] ([id], [name], [slug], [description], [shortDescription], [sku], [price], [discountPrice], [stockQuantity], [isActive], [isFeatured], [viewCount], [saleCount], [createdAt], [updatedAt])
    VALUES 
    (1, N'Áo Sơ Mi Cotton Trắng', 'ao-so-mi-cotton-trang', N'Áo sơ mi cotton 100%, mềm mại, thấm hút mồ hôi tốt. Phong cách thanh lịch, phù hợp cho nhiều dịp.', N'Áo sơ mi cotton 100% mềm mại', 'SM-001', 399000, 299000, 100, 1, 1, 1250, 350, DATEADD(DAY, -30, GETDATE()), GETDATE()),
    (2, N'Áo Thun Basic Đen', 'ao-thun-basic-den', N'Áo thun cotton basic, form chuẩn, màu sắc đa dạng. Phù hợp cho mọi phong cách.', N'Áo thun cotton basic', 'AT-001', 199000, 149000, 200, 1, 1, 2500, 620, DATEADD(DAY, -25, GETDATE()), GETDATE()),
    (3, N'Quần Jean Slim Fit Xanh Dương', 'quan-jean-slim-fit-xanh-duong', N'Quần jean slim fit, chất liệu jean cao cấp, form dáng chuẩn, phù hợp với nhiều vóc dáng.', N'Quần jean slim fit cao cấp', 'QJ-001', 599000, 449000, 80, 1, 0, 980, 230, DATEADD(DAY, -20, GETDATE()), GETDATE()),
    (4, N'Váy Xòe Hoa Văn', 'vay-xoe-hoa-van', N'Váy xòe hoa văn nữ, chất liệu lụa mềm mại, thiết kế thanh lịch, phù hợp đi làm hay đi chơi.', N'Váy xòe hoa văn thanh lịch', 'VY-001', 499000, 399000, 60, 1, 1, 1800, 410, DATEADD(DAY, -15, GETDATE()), GETDATE()),
    (5, N'Đầm Công Sở Màu Xanh Navy', 'dam-cong-so-mau-xanh-navy', N'Đầm công sở màu xanh navy, thiết kế lịch lãm, chất liệu cao cấp, phù hợp môi trường làm việc chuyên nghiệp.', N'Đầm công sở lịch lãm', 'DM-001', 799000, 599000, 40, 1, 0, 750, 180, DATEADD(DAY, -10, GETDATE()), GETDATE()),
    (6, N'Áo Khoác Bomber Nâu', 'ao-khoac-bomber-nau', N'Áo khoác bomber màu nâu, chất liệu da cao cấp, giữ ấm tốt, phong cách thời trang.', N'Áo khoác bomber chất liệu da', 'AK-001', 1299000, 999000, 30, 1, 1, 1100, 290, DATEADD(DAY, -5, GETDATE()), GETDATE()),
    (7, N'Giày Sneaker Trắng', 'giay-sneaker-trang', N'Giày sneaker trắng, thiết kế hiện đại, nhẹ nhàng, phù hợp đi học hay đi làm.', N'Giày sneaker hiện đại', 'GS-001', 699000, 499000, 120, 1, 0, 1500, 380, GETDATE(), GETDATE()),
    (8, N'Kính Mát Polarized', 'kinh-mat-polarized', N'Kính mát polarized, chống tia UV tốt, thiết kế thời trang, phù hợp mọi dịp.', N'Kính mát chống UV', 'PK-001', 399000, 299000, 90, 1, 0, 890, 210, GETDATE(), GETDATE());
    SET IDENTITY_INSERT [dbo].[products] OFF;
END
GO

-- Assign categories to products
IF NOT EXISTS (SELECT * FROM [dbo].[product_categories] WHERE [productId] = 1)
BEGIN
    INSERT INTO [dbo].[product_categories] ([productId], [categoryId])
    VALUES 
    (1, 1), -- Áo sơ mi
    (2, 2), -- Áo thun
    (3, 3), -- Quần jean
    (4, 4), -- Váy
    (5, 5), -- Đầm
    (6, 6), -- Áo khoác
    (7, 7), -- Giày dép
    (8, 8); -- Phụ kiện
END
GO

-- Insert product images
IF NOT EXISTS (SELECT * FROM [dbo].[product_images] WHERE [productId] = 1)
BEGIN
    INSERT INTO [dbo].[product_images] ([productId], [imageUrl], [altText], [isPrimary], [sortOrder])
    VALUES 
    (1, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop', N'Áo sơ mi cotton trắng', 1, 1),
    (1, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop', N'Áo sơ mi cotton trắng - chi tiết', 0, 2),
    (2, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop', N'Áo thun basic đen', 1, 1),
    (3, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=800&fit=crop', N'Quần jean slim fit xanh dương', 1, 1),
    (4, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=800&fit=crop', N'Váy xòe hoa văn', 1, 1),
    (5, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&h=800&fit=crop', N'Đầm công sở màu xanh navy', 1, 1),
    (6, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop', N'Áo khoác bomber nâu', 1, 1),
    (7, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop', N'Giày sneaker trắng', 1, 1),
    (8, 'https://images.unsplash.com/photo-1611926648087-2693b90e4963?w=800&h=800&fit=crop', N'Kính mát polarized', 1, 1);
END
GO

-- Insert product variants
IF NOT EXISTS (SELECT * FROM [dbo].[product_variants] WHERE [productId] = 1)
BEGIN
    INSERT INTO [dbo].[product_variants] ([productId], [size], [color], [sku], [stockQuantity], [price])
    VALUES 
    (1, 'S', N'Trắng', 'SM-001-S', 20, 299000),
    (1, 'M', N'Trắng', 'SM-001-M', 30, 299000),
    (1, 'L', N'Trắng', 'SM-001-L', 25, 299000),
    (1, 'XL', N'Trắng', 'SM-001-XL', 15, 299000),
    (1, 'S', N'Xanh Dương', 'SM-001-S-XD', 10, 299000),
    (2, 'S', N'Đen', 'AT-001-S', 40, 149000),
    (2, 'M', N'Đen', 'AT-001-M', 60, 149000),
    (2, 'L', N'Đen', 'AT-001-L', 50, 149000),
    (2, 'XL', N'Đen', 'AT-001-XL', 30, 149000),
    (2, 'M', N'Trắng', 'AT-001-M-T', 20, 149000),
    (3, '28', N'Xanh Dương', 'QJ-001-28', 15, 449000),
    (3, '29', N'Xanh Dương', 'QJ-001-29', 20, 449000),
    (3, '30', N'Xanh Dương', 'QJ-001-30', 25, 449000),
    (3, '31', N'Xanh Dương', 'QJ-001-31', 10, 449000),
    (3, '32', N'Xanh Dương', 'QJ-001-32', 10, 449000);
END
GO

PRINT 'Sample products inserted successfully!';
GO

-- =============================================================
-- Sample: Addresses (100 addresses for users)
-- =============================================================
PRINT 'Inserting sample addresses...';
GO

DECLARE @addressCounter INT = 1;
DECLARE @addressCities NVARCHAR(MAX) = N'Hà Nội,Hồ Chí Minh,Đà Nẵng,Hải Phòng,Cần Thơ,Nha Trang,Vũng Tàu,Đà Lạt,Phú Quốc,Quy Nhơn';
DECLARE @districts NVARCHAR(MAX) = N'Quận 1,Quận 2,Quận 3,Quận 4,Quận 5,Quận 6,Quận 7,Quận 8,Quận 9,Quận 10,Quận 11,Quận 12,Quận Bình Thạnh,Quận Gò Vấp,Quận Tân Bình';
DECLARE @wards NVARCHAR(MAX) = N'Phường 1,Phường 2,Phường 3,Phường 4,Phường 5,Phường 6,Phường 7,Phường 8,Phường 9,Phường 10';

WHILE @addressCounter <= 100
BEGIN
    DECLARE @addrCityIndex INT = FLOOR(RAND() * (LEN(@addressCities) - LEN(REPLACE(@addressCities, ',', '')) + 1)) + 1;
    DECLARE @addrDistrictIndex INT = FLOOR(RAND() * (LEN(@districts) - LEN(REPLACE(@districts, ',', '')) + 1)) + 1;
    DECLARE @addrWardIndex INT = FLOOR(RAND() * (LEN(@wards) - LEN(REPLACE(@wards, ',', '')) + 1)) + 1;
    
    DECLARE @addrCity NVARCHAR(100);
    DECLARE @addrDistrict NVARCHAR(100);
    DECLARE @addrWard NVARCHAR(100);
    
    WITH AddrCities AS (SELECT value AS Name, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@addressCities, ','))
    SELECT @addrCity = Name FROM AddrCities WHERE RN = @addrCityIndex;
    
    WITH AddrDistricts AS (SELECT value AS Name, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@districts, ','))
    SELECT @addrDistrict = Name FROM AddrDistricts WHERE RN = @addrDistrictIndex;
    
    WITH AddrWards AS (SELECT value AS Name, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@wards, ','))
    SELECT @addrWard = Name FROM AddrWards WHERE RN = @addrWardIndex;
    
    -- Get user's full name
    DECLARE @userFullName NVARCHAR(255);
    DECLARE @userPhone NVARCHAR(20);
    SELECT @userFullName = [fullName], @userPhone = [phone] FROM [dbo].[users] WHERE [id] = @addressCounter;
    
    INSERT INTO [dbo].[addresses] ([userId], [fullName], [phone], [addressLine1], [city], [district], [ward], [isDefault], [createdAt], [updatedAt])
    VALUES 
    (@addressCounter, @userFullName, @userPhone, N'Số ' + CAST(FLOOR(1 + RAND() * 500) AS NVARCHAR(10)) + N' Đường ABC', @addrCity, @addrDistrict, @addrWard, 1, DATEADD(DAY, -FLOOR(RAND() * 300), GETDATE()), GETDATE());
    
    SET @addressCounter = @addressCounter + 1;
END
GO

PRINT 'Sample addresses inserted successfully!';
GO

-- =============================================================
-- Sample: Orders (100 orders)
-- =============================================================
PRINT 'Inserting sample orders...';
GO

DECLARE @orderCounter INT = 1;
DECLARE @orderStatuses NVARCHAR(MAX) = N'PENDING,PROCESSING,SHIPPING,DELIVERED,CANCELLED,REFUNDED';
DECLARE @paymentMethods NVARCHAR(MAX) = N'COD,MOMO,ZALOPAY,QR_DEMO';
DECLARE @paymentStatuses NVARCHAR(MAX) = N'UNPAID,PENDING,PAID,FAILED,REFUNDED';

WHILE @orderCounter <= 100
BEGIN
    DECLARE @orderUserId INT = FLOOR(3 + RAND() * 98); -- Random user from 3 to 100
    DECLARE @orderStatusIndex INT = FLOOR(RAND() * (LEN(@orderStatuses) - LEN(REPLACE(@orderStatuses, ',', '')) + 1)) + 1;
    DECLARE @paymentMethodIndex INT = FLOOR(RAND() * (LEN(@paymentMethods) - LEN(REPLACE(@paymentMethods, ',', '')) + 1)) + 1;
    DECLARE @paymentStatusIndex INT = FLOOR(RAND() * (LEN(@paymentStatuses) - LEN(REPLACE(@paymentStatuses, ',', '')) + 1)) + 1;
    
    DECLARE @orderStatus NVARCHAR(50);
    DECLARE @paymentMethod NVARCHAR(50);
    DECLARE @paymentStatus NVARCHAR(50);
    
    WITH OrderStatuses AS (SELECT value AS Status, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@orderStatuses, ','))
    SELECT @orderStatus = Status FROM OrderStatuses WHERE RN = @orderStatusIndex;
    
    WITH PaymentMethods AS (SELECT value AS Method, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@paymentMethods, ','))
    SELECT @paymentMethod = Method FROM PaymentMethods WHERE RN = @paymentMethodIndex;
    
    WITH PaymentStatuses AS (SELECT value AS Status, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@paymentStatuses, ','))
    SELECT @paymentStatus = Status FROM PaymentStatuses WHERE RN = @paymentStatusIndex;
    
    -- Get user's address
    DECLARE @shippingAddress NVARCHAR(MAX);
    SELECT TOP 1 @shippingAddress = (SELECT [fullName] AS name, [phone] AS phone, [addressLine1] AS address, [city] AS city, [district] AS district, [ward] AS ward FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
    FROM [dbo].[addresses] WHERE [userId] = @orderUserId;
    
    DECLARE @totalAmount DECIMAL(12, 2) = FLOOR(200000 + RAND() * 2000000);
    DECLARE @shippingFee DECIMAL(12, 2) = IIF(@totalAmount > 500000, 0, 30000);
    DECLARE @discountAmount DECIMAL(12, 2) = FLOOR(RAND() * 200000);
    DECLARE @taxAmount DECIMAL(12, 2) = FLOOR(@totalAmount * 0.1);
    DECLARE @orderNumber NVARCHAR(50) = 'ORD-' + RIGHT('000000' + CAST(@orderCounter AS NVARCHAR(10)), 6);
    DECLARE @orderCreatedAt DATETIME = DATEADD(DAY, -FLOOR(RAND() * 90), GETDATE());
    DECLARE @paidAt DATETIME = IIF(@paymentStatus = 'PAID' OR @paymentStatus = 'REFUNDED', DATEADD(HOUR, FLOOR(1 + RAND() * 48), @orderCreatedAt), NULL);
    DECLARE @shippedAt DATETIME = IIF(@orderStatus IN ('SHIPPING', 'DELIVERED', 'REFUNDED'), DATEADD(DAY, FLOOR(1 + RAND() * 7), @orderCreatedAt), NULL);
    DECLARE @deliveredAt DATETIME = IIF(@orderStatus IN ('DELIVERED', 'REFUNDED'), DATEADD(DAY, FLOOR(1 + RAND() * 14), @orderCreatedAt), NULL);
    
    SET IDENTITY_INSERT [dbo].[orders] ON;
    INSERT INTO [dbo].[orders] ([id], [userId], [orderNumber], [orderStatus], [totalAmount], [shippingFee], [taxAmount], [discountAmount], [shippingAddress], [paymentMethod], [paymentStatus], [paidAt], [shippedAt], [deliveredAt], [createdAt], [updatedAt])
    VALUES 
    (@orderCounter, @orderUserId, @orderNumber, @orderStatus, @totalAmount, @shippingFee, @taxAmount, @discountAmount, @shippingAddress, @paymentMethod, @paymentStatus, @paidAt, @shippedAt, @deliveredAt, @orderCreatedAt, GETDATE());
    SET IDENTITY_INSERT [dbo].[orders] OFF;
    
    SET @orderCounter = @orderCounter + 1;
END
GO

PRINT 'Sample orders inserted successfully!';
GO

-- =============================================================
-- Sample: Order Details (300 items)
-- =============================================================
PRINT 'Inserting sample order details...';
GO

DECLARE @orderDetailCounter INT = 1;
DECLARE @sizes NVARCHAR(MAX) = N'S,M,L,XL';
DECLARE @colors NVARCHAR(MAX) = N'Trắng,Đen,Xanh Dương,Đỏ,Vàng,Nâu,Hồng';

WHILE @orderDetailCounter <= 300
BEGIN
    DECLARE @odOrderId INT = FLOOR(1 + RAND() * 100);
    DECLARE @odProductId INT = FLOOR(1 + RAND() * 8);
    DECLARE @odQuantity INT = FLOOR(1 + RAND() * 3);
    DECLARE @odSizeIndex INT = FLOOR(RAND() * (LEN(@sizes) - LEN(REPLACE(@sizes, ',', '')) + 1)) + 1;
    DECLARE @odColorIndex INT = FLOOR(RAND() * (LEN(@colors) - LEN(REPLACE(@colors, ',', '')) + 1)) + 1;
    
    DECLARE @odSize NVARCHAR(20);
    DECLARE @odColor NVARCHAR(50);
    
    WITH Sizes AS (SELECT value AS Size, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@sizes, ','))
    SELECT @odSize = Size FROM Sizes WHERE RN = @odSizeIndex;
    
    WITH Colors AS (SELECT value AS Color, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@colors, ','))
    SELECT @odColor = Color FROM Colors WHERE RN = @odColorIndex;
    
    -- Get product info
    DECLARE @productName NVARCHAR(255);
    DECLARE @productSku NVARCHAR(50);
    DECLARE @productImage NVARCHAR(255);
    DECLARE @productPrice DECIMAL(12,2);
    SELECT @productName = [name], @productSku = [sku], @productPrice = ISNULL([discountPrice], [price])
    FROM [dbo].[products] WHERE [id] = @odProductId;
    
    SELECT TOP 1 @productImage = [imageUrl] FROM [dbo].[product_images] WHERE [productId] = @odProductId ORDER BY [isPrimary] DESC;
    
    SET IDENTITY_INSERT [dbo].[order_details] ON;
    INSERT INTO [dbo].[order_details] ([id], [orderId], [productId], [productName], [productSku], [productImage], [quantity], [price], [size], [color], [createdAt])
    VALUES 
    (@orderDetailCounter, @odOrderId, @odProductId, @productName, @productSku, @productImage, @odQuantity, @productPrice, @odSize, @odColor, GETDATE());
    SET IDENTITY_INSERT [dbo].[order_details] OFF;
    
    SET @orderDetailCounter = @orderDetailCounter + 1;
END
GO

PRINT 'Sample order details inserted successfully!';
GO

-- =============================================================
-- Sample: Vouchers (30 vouchers)
-- =============================================================
PRINT 'Inserting sample vouchers...';
GO

IF NOT EXISTS (SELECT * FROM [dbo].[vouchers] WHERE [code] = 'GIAM100K')
BEGIN
    SET IDENTITY_INSERT [dbo].[vouchers] ON;
    INSERT INTO [dbo].[vouchers] ([id], [code], [discountType], [discountValue], [minOrderValue], [maxUsage], [usedCount], [startDate], [endDate], [isActive], [createdAt], [updatedAt])
    VALUES 
    (1, 'GIAM100K', 'fixed', 100000, 500000, 1000, 234, DATEADD(DAY, -30, GETDATE()), DATEADD(DAY, 30, GETDATE()), 1, GETDATE(), GETDATE()),
    (2, 'GIAM200K', 'fixed', 200000, 1000000, 500, 123, DATEADD(DAY, -30, GETDATE()), DATEADD(DAY, 30, GETDATE()), 1, GETDATE(), GETDATE()),
    (3, 'GIAM10P', 'percent', 10, 300000, 2000, 567, DATEADD(DAY, -30, GETDATE()), DATEADD(DAY, 30, GETDATE()), 1, GETDATE(), GETDATE()),
    (4, 'GIAM15P', 'percent', 15, 500000, 1000, 345, DATEADD(DAY, -30, GETDATE()), DATEADD(DAY, 30, GETDATE()), 1, GETDATE(), GETDATE()),
    (5, 'FREESHIP', 'fixed', 30000, 0, 3000, 890, DATEADD(DAY, -30, GETDATE()), DATEADD(DAY, 30, GETDATE()), 1, GETDATE(), GETDATE());
    
    DECLARE @voucherCounter INT = 6;
    WHILE @voucherCounter <= 30
    BEGIN
        DECLARE @voucherCode NVARCHAR(50) = 'SALE' + CAST(@voucherCounter AS NVARCHAR(10)) + 'K';
        DECLARE @voucherType NVARCHAR(20) = IIF(RAND() > 0.5, 'fixed', 'percent');
        DECLARE @voucherValue DECIMAL(12,2) = IIF(@voucherType = 'fixed', FLOOR(50000 + RAND() * 200000), FLOOR(5 + RAND() * 20));
        INSERT INTO [dbo].[vouchers] ([code], [discountType], [discountValue], [minOrderValue], [maxUsage], [usedCount], [startDate], [endDate], [isActive], [createdAt], [updatedAt])
        VALUES 
        (@voucherCode, @voucherType, @voucherValue, FLOOR(200000 + RAND() * 500000), FLOOR(100 + RAND() * 1000), FLOOR(RAND() * 200), DATEADD(DAY, -FLOOR(RAND() * 30), GETDATE()), DATEADD(DAY, 30 + FLOOR(RAND() * 60), GETDATE()), 1, GETDATE(), GETDATE());
        SET @voucherCounter = @voucherCounter + 1;
    END
    
    SET IDENTITY_INSERT [dbo].[vouchers] OFF;
END
GO

PRINT 'Sample vouchers inserted successfully!';
GO

-- =============================================================
-- Sample: Order Vouchers (100)
-- =============================================================
PRINT 'Inserting sample order vouchers...';
GO

DECLARE @ovCounter INT = 1;
WHILE @ovCounter <= 100
BEGIN
    INSERT INTO [dbo].[order_vouchers] ([orderId], [voucherId], [createdAt])
    VALUES 
    (FLOOR(1 + RAND() * 100), FLOOR(1 + RAND() * 30), GETDATE());
    SET @ovCounter = @ovCounter + 1;
END
GO

PRINT 'Sample order vouchers inserted successfully!';
GO

-- =============================================================
-- Sample: Payments (100)
-- =============================================================
PRINT 'Inserting sample payments...';
GO

DECLARE @paymentCounter INT = 1;
WHILE @paymentCounter <= 100
BEGIN
    DECLARE @payOrderId INT = @paymentCounter;
    DECLARE @payAmount DECIMAL(12,2);
    DECLARE @payMethod NVARCHAR(50);
    DECLARE @payStatus NVARCHAR(50);
    DECLARE @payPaidAt DATETIME;
    
    SELECT @payAmount = [totalAmount], @payMethod = [paymentMethod], @payStatus = [paymentStatus], @payPaidAt = [paidAt]
    FROM [dbo].[orders] WHERE [id] = @payOrderId;
    
    SET IDENTITY_INSERT [dbo].[payments] ON;
    INSERT INTO [dbo].[payments] ([id], [orderId], [paymentMethod], [amount], [transactionId], [paymentStatus], [paidAt], [createdAt], [updatedAt])
    VALUES 
    (@paymentCounter, @payOrderId, @payMethod, @payAmount, 'TXN-' + RIGHT('000000' + CAST(@paymentCounter AS NVARCHAR(10)), 6), @payStatus, @payPaidAt, GETDATE(), GETDATE());
    SET IDENTITY_INSERT [dbo].[payments] OFF;
    
    SET @paymentCounter = @paymentCounter + 1;
END
GO

PRINT 'Sample payments inserted successfully!';
GO

-- =============================================================
-- Sample: Payment Logs (100)
-- =============================================================
PRINT 'Inserting sample payment logs...';
GO

DECLARE @plCounter INT = 1;
WHILE @plCounter <= 100
BEGIN
    INSERT INTO [dbo].[payment_logs] ([paymentId], [requestData], [responseData], [logType], [createdAt])
    VALUES 
    (@plCounter, '{}', '{"success":true}', 'CREATE_QR', GETDATE()),
    (@plCounter, '{}', '{"success":true}', 'PAYMENT_SUCCESS', GETDATE());
    SET @plCounter = @plCounter + 1;
END
GO

PRINT 'Sample payment logs inserted successfully!';
GO

-- =============================================================
-- Sample: Shippings (100)
-- =============================================================
PRINT 'Inserting sample shippings...';
GO

DECLARE @shippingCounter INT = 1;
DECLARE @shippingPartners NVARCHAR(MAX) = N'GHTK,Viettel Post,J&T Express,Shopee Express,GHN';

WHILE @shippingCounter <= 100
BEGIN
    DECLARE @shipOrderId INT = @shippingCounter;
    DECLARE @shipStatus NVARCHAR(50);
    DECLARE @shipEstimated DATETIME;
    DECLARE @shipActual DATETIME;
    DECLARE @shipPartnerIndex INT = FLOOR(RAND() * (LEN(@shippingPartners) - LEN(REPLACE(@shippingPartners, ',', '')) + 1)) + 1;
    DECLARE @shipPartner NVARCHAR(100);
    
    WITH ShipPartners AS (SELECT value AS Partner, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@shippingPartners, ','))
    SELECT @shipPartner = Partner FROM ShipPartners WHERE RN = @shipPartnerIndex;
    
    SELECT @shipStatus = CASE 
        WHEN [orderStatus] = 'PENDING' THEN 'PENDING'
        WHEN [orderStatus] = 'PROCESSING' THEN 'PENDING'
        WHEN [orderStatus] = 'SHIPPING' THEN 'IN_TRANSIT'
        WHEN [orderStatus] = 'DELIVERED' THEN 'DELIVERED'
        WHEN [orderStatus] = 'REFUNDED' THEN 'DELIVERED'
        ELSE 'PENDING'
    END,
    @shipEstimated = DATEADD(DAY, 3, [shippedAt]),
    @shipActual = [deliveredAt]
    FROM [dbo].[orders] WHERE [id] = @shipOrderId;
    
    SET IDENTITY_INSERT [dbo].[shippings] ON;
    INSERT INTO [dbo].[shippings] ([id], [orderId], [trackingCode], [shippingPartner], [shippingStatus], [estimatedDelivery], [actualDelivery], [createdAt], [updatedAt])
    VALUES 
    (@shippingCounter, @shipOrderId, 'SHIP' + CAST(FLOOR(10000000 + RAND() * 90000000) AS NVARCHAR(10)), @shipPartner, @shipStatus, @shipEstimated, @shipActual, GETDATE(), GETDATE());
    SET IDENTITY_INSERT [dbo].[shippings] OFF;
    
    SET @shippingCounter = @shippingCounter + 1;
END
GO

PRINT 'Sample shippings inserted successfully!';
GO

-- =============================================================
-- Sample: Refund Requests (30)
-- =============================================================
PRINT 'Inserting sample refund requests...';
GO

DECLARE @refundCounter INT = 1;
WHILE @refundCounter <= 30
BEGIN
    DECLARE @refundOrderId INT = FLOOR(1 + RAND() * 100);
    DECLARE @refundStatus NVARCHAR(50) = IIF(RAND() > 0.5, 'APPROVED', IIF(RAND() > 0.5, 'REJECTED', 'PENDING'));
    DECLARE @refundReasons NVARCHAR(MAX) = N'Sản phẩm không như mô tả,Sản phẩm bị lỗi,Đổi size/màu,Không cần thiết nữa,Giao hàng quá chậm';
    DECLARE @refundReasonIndex INT = FLOOR(RAND() * (LEN(@refundReasons) - LEN(REPLACE(@refundReasons, ',', '')) + 1)) + 1;
    DECLARE @refundReason NVARCHAR(MAX);
    
    WITH RefundReasons AS (SELECT value AS Reason, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@refundReasons, ','))
    SELECT @refundReason = Reason FROM RefundReasons WHERE RN = @refundReasonIndex;
    
    SET IDENTITY_INSERT [dbo].[refund_requests] ON;
    INSERT INTO [dbo].[refund_requests] ([id], [orderId], [reason], [status], [requestedAt], [resolvedAt], [resolutionNote])
    VALUES 
    (@refundCounter, @refundOrderId, @refundReason, @refundStatus, DATEADD(DAY, -FLOOR(1 + RAND() * 30), GETDATE()), IIF(@refundStatus <> 'PENDING', DATEADD(DAY, FLOOR(1 + RAND() * 7), GETDATE()), NULL), IIF(@refundStatus = 'APPROVED', N'Yêu cầu hoàn trả đã được chấp thuận', IIF(@refundStatus = 'REJECTED', N'Yêu cầu hoàn trả không đủ điều kiện', NULL)));
    SET IDENTITY_INSERT [dbo].[refund_requests] OFF;
    
    SET @refundCounter = @refundCounter + 1;
END
GO

PRINT 'Sample refund requests inserted successfully!';
GO

-- =============================================================
-- Sample: Reviews (100)
-- =============================================================
PRINT 'Inserting sample reviews...';
GO

DECLARE @reviewCounter INT = 1;
DECLARE @reviewTitles NVARCHAR(MAX) = N'Sản phẩm tuyệt vời,Chất lượng tốt,Giao hàng nhanh,Đúng như mô tả,Rất đáng tiền,Sẽ ủng hộ tiếp,Đẹp quá,Form chuẩn,Màu sắc đẹp,Thấm hút mồ hôi tốt';
DECLARE @reviewContents NVARCHAR(MAX) = N'Sản phẩm rất đẹp, chất lượng tốt, đóng gói cẩn thận. Tôi rất hài lòng và sẽ ủng hộ shop tiếp theo!,Chất liệu cotton mềm mại, mặc rất thoải mái. Form chuẩn, đúng size. Giao hàng nhanh, nhân viên giao hàng lịch sự.,Đúng như mô tả, màu sắc đẹp, không bị chênh lệch. Sản phẩm đáng tiền, tôi rất hài lòng.,Mặc rất thoải mái, chất liệu tốt, không gây ngứa. Giao hàng nhanh, đóng gói đẹp. Sẽ giới thiệu bạn bè đến với shop.,Sản phẩm vượt ngoài mong đợi, chất lượng rất tốt. Shop tư vấn nhiệt tình, giao hàng nhanh. Rất hài lòng!';
DECLARE @reviewCities NVARCHAR(MAX) = N'Hà Nội,Hồ Chí Minh,Đà Nẵng,Hải Phòng,Cần Thơ,Nha Trang,Vũng Tàu,Đà Lạt,Phú Quốc,Quy Nhơn';

WHILE @reviewCounter <= 100
BEGIN
    DECLARE @reviewProductId INT = FLOOR(1 + RAND() * 8);
    DECLARE @reviewUserId INT = FLOOR(3 + RAND() * 98);
    DECLARE @reviewRating INT = FLOOR(3 + RAND() * 3); -- 3-5 stars
    DECLARE @reviewTitleIndex INT = FLOOR(RAND() * (LEN(@reviewTitles) - LEN(REPLACE(@reviewTitles, ',', '')) + 1)) + 1;
    DECLARE @reviewContentIndex INT = FLOOR(RAND() * (LEN(@reviewContents) - LEN(REPLACE(@reviewContents, ',', '')) + 1)) + 1;
    DECLARE @reviewCityIndex INT = FLOOR(RAND() * (LEN(@reviewCities) - LEN(REPLACE(@reviewCities, ',', '')) + 1)) + 1;
    
    DECLARE @reviewTitle NVARCHAR(255);
    DECLARE @reviewContent NVARCHAR(MAX);
    DECLARE @reviewCity NVARCHAR(100);
    
    WITH ReviewTitles AS (SELECT value AS Title, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@reviewTitles, ','))
    SELECT @reviewTitle = Title FROM ReviewTitles WHERE RN = @reviewTitleIndex;
    
    WITH ReviewContents AS (SELECT value AS Content, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@reviewContents, ','))
    SELECT @reviewContent = Content FROM ReviewContents WHERE RN = @reviewContentIndex;
    
    WITH ReviewCities AS (SELECT value AS City, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@reviewCities, ','))
    SELECT @reviewCity = City FROM ReviewCities WHERE RN = @reviewCityIndex;
    
    -- Random size and color
    DECLARE @reviewSize NVARCHAR(20);
    DECLARE @reviewColor NVARCHAR(50);
    DECLARE @sizeOptions NVARCHAR(MAX) = N'S,M,L,XL';
    DECLARE @colorOptions NVARCHAR(MAX) = N'Trắng,Đen,Xanh Dương,Đỏ,Vàng,Nâu';
    DECLARE @sizeIdx INT = FLOOR(RAND() * (LEN(@sizeOptions) - LEN(REPLACE(@sizeOptions, ',', '')) + 1)) + 1;
    DECLARE @colorIdx INT = FLOOR(RAND() * (LEN(@colorOptions) - LEN(REPLACE(@colorOptions, ',', '')) + 1)) + 1;
    
    WITH SizeOpts AS (SELECT value AS Size, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@sizeOptions, ','))
    SELECT @reviewSize = Size FROM SizeOpts WHERE RN = @sizeIdx;
    
    WITH ColorOpts AS (SELECT value AS Color, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@colorOptions, ','))
    SELECT @reviewColor = Color FROM ColorOpts WHERE RN = @colorIdx;
    
    DECLARE @hasPurchased BIT = 1;
    DECLARE @likesCount INT = FLOOR(RAND() * 50);
    DECLARE @helpfulCount INT = FLOOR(RAND() * 30);
    DECLARE @reviewImages NVARCHAR(MAX) = IIF(RAND() > 0.5, '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"]', NULL);
    
    SET IDENTITY_INSERT [dbo].[reviews] ON;
    INSERT INTO [dbo].[reviews] ([id], [productId], [userId], [rating], [title], [comment], [images], [size], [color], [city], [likesCount], [helpfulCount], [hasPurchased], [status], [createdAt], [updatedAt])
    VALUES 
    (@reviewCounter, @reviewProductId, @reviewUserId, @reviewRating, @reviewTitle, @reviewContent, @reviewImages, @reviewSize, @reviewColor, @reviewCity, @likesCount, @helpfulCount, @hasPurchased, 'APPROVED', DATEADD(DAY, -FLOOR(RAND() * 60), GETDATE()), GETDATE());
    SET IDENTITY_INSERT [dbo].[reviews] OFF;
    
    SET @reviewCounter = @reviewCounter + 1;
END
GO

PRINT 'Sample reviews inserted successfully!';
GO

-- =============================================================
-- Sample: Banners (20)
-- =============================================================
PRINT 'Inserting sample banners...';
GO

IF NOT EXISTS (SELECT * FROM [dbo].[banners] WHERE [id] = 1)
BEGIN
    SET IDENTITY_INSERT [dbo].[banners] ON;
    INSERT INTO [dbo].[banners] ([id], [title], [subtitle], [imageUrl], [linkUrl], [isActive], [sortOrder], [createdAt], [updatedAt])
    VALUES 
    (1, N'Khuyến Mãi Hè 2024', N'Giảm giá đến 50%', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=400&fit=crop', '/collections/sale', 1, 1, GETDATE(), GETDATE()),
    (2, N'Bộ Sưu Tập Mới', N'Spring/Summer 2024', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=400&fit=crop', '/collections/new-arrivals', 1, 2, GETDATE(), GETDATE()),
    (3, N'Miễn Phí Vận Chuyển', N'Đơn hàng từ 500K', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop', '/', 1, 3, GETDATE(), GETDATE());
    
    DECLARE @bannerCounter INT = 4;
    WHILE @bannerCounter <= 20
    BEGIN
        INSERT INTO [dbo].[banners] ([title], [subtitle], [imageUrl], [linkUrl], [isActive], [sortOrder], [createdAt], [updatedAt])
        VALUES 
        (N'Banner ' + CAST(@bannerCounter AS NVARCHAR(10)), N'Subtitle ' + CAST(@bannerCounter AS NVARCHAR(10)), 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop', '/', 1, @bannerCounter, GETDATE(), GETDATE());
        SET @bannerCounter = @bannerCounter + 1;
    END
    SET IDENTITY_INSERT [dbo].[banners] OFF;
END
GO

PRINT 'Sample banners inserted successfully!';
GO

-- =============================================================
-- Sample: Wishlists & Wishlist Items (100)
-- =============================================================
PRINT 'Inserting sample wishlists and wishlist items...';
GO

DECLARE @wishlistCounter INT = 1;
WHILE @wishlistCounter <= 100
BEGIN
    -- Create wishlist for user
    SET IDENTITY_INSERT [dbo].[wishlists] ON;
    INSERT INTO [dbo].[wishlists] ([id], [userId], [createdAt], [updatedAt])
    VALUES 
    (@wishlistCounter, @wishlistCounter + 2, GETDATE(), GETDATE());
    SET IDENTITY_INSERT [dbo].[wishlists] OFF;
    
    -- Add 1-3 items to wishlist
    DECLARE @itemCount INT = FLOOR(1 + RAND() * 3);
    DECLARE @itemCounter INT = 1;
    WHILE @itemCounter <= @itemCount
    BEGIN
        INSERT INTO [dbo].[wishlist_items] ([wishlistId], [productId], [createdAt])
        VALUES 
        (@wishlistCounter, FLOOR(1 + RAND() * 8), GETDATE());
        SET @itemCounter = @itemCounter + 1;
    END
    
    SET @wishlistCounter = @wishlistCounter + 1;
END
GO

PRINT 'Sample wishlists and wishlist items inserted successfully!';
GO

-- =============================================================
-- Sample: Carts & Cart Items (100 carts, 300 items)
-- =============================================================
PRINT 'Inserting sample carts and cart items...';
GO

DECLARE @cartCounter INT = 1;
DECLARE @cartItemCounter INT = 1;

WHILE @cartCounter <= 100
BEGIN
    -- Create cart for user
    SET IDENTITY_INSERT [dbo].[carts] ON;
    INSERT INTO [dbo].[carts] ([id], [userId], [totalAmount], [createdAt], [updatedAt])
    VALUES 
    (@cartCounter, @cartCounter + 2, 0, GETDATE(), GETDATE());
    SET IDENTITY_INSERT [dbo].[carts] OFF;
    
    -- Add 1-3 items to cart
    DECLARE @cartItemCount INT = FLOOR(1 + RAND() * 3);
    DECLARE @cartItemIdx INT = 1;
    WHILE @cartItemIdx <= @cartItemCount
    BEGIN
        DECLARE @cartProductId INT = FLOOR(1 + RAND() * 8);
        DECLARE @cartQuantity INT = FLOOR(1 + RAND() * 2);
        DECLARE @cartProductPrice DECIMAL(12,2);
        SELECT @cartProductPrice = ISNULL([discountPrice], [price]) FROM [dbo].[products] WHERE [id] = @cartProductId;
        
        SET IDENTITY_INSERT [dbo].[cart_items] ON;
        INSERT INTO [dbo].[cart_items] ([id], [cartId], [productId], [quantity], [price], [size], [color], [createdAt], [updatedAt])
        VALUES 
        (@cartItemCounter, @cartCounter, @cartProductId, @cartQuantity, @cartProductPrice, IIF(RAND() > 0.5, 'M', 'L'), IIF(RAND() > 0.5, N'Trắng', N'Đen'), GETDATE(), GETDATE());
        SET IDENTITY_INSERT [dbo].[cart_items] OFF;
        
        SET @cartItemCounter = @cartItemCounter + 1;
        SET @cartItemIdx = @cartItemIdx + 1;
    END
    
    SET @cartCounter = @cartCounter + 1;
END
GO

PRINT 'Sample carts and cart items inserted successfully!';
GO

-- =============================================================
-- Sample: Notifications (100)
-- =============================================================
PRINT 'Inserting sample notifications...';
GO

DECLARE @notifCounter INT = 1;
DECLARE @notifTypes NVARCHAR(MAX) = N'ORDER,REVIEW,PROMOTION,NEWS';
DECLARE @notifTitles NVARCHAR(MAX) = N'Đơn hàng của bạn đã được giao,Đánh giá sản phẩm,Khuyến mãi mới,Tin tức mới';
DECLARE @notifMessages NVARCHAR(MAX) = N'Đơn hàng #ORD-000001 đã được giao thành công!,Bạn có đánh giá mới cho sản phẩm Áo Sơ Mi Cotton Trắng,Chương trình khuyến mãi hè 2024: Giảm đến 50%!,Bộ sưu tập mới Spring/Summer 2024 đã có mặt!';

WHILE @notifCounter <= 100
BEGIN
    DECLARE @notifUserId INT = FLOOR(3 + RAND() * 98);
    DECLARE @notifTypeIndex INT = FLOOR(RAND() * (LEN(@notifTypes) - LEN(REPLACE(@notifTypes, ',', '')) + 1)) + 1;
    DECLARE @notifTitleIndex INT = FLOOR(RAND() * (LEN(@notifTitles) - LEN(REPLACE(@notifTitles, ',', '')) + 1)) + 1;
    DECLARE @notifMessageIndex INT = FLOOR(RAND() * (LEN(@notifMessages) - LEN(REPLACE(@notifMessages, ',', '')) + 1)) + 1;
    
    DECLARE @notifType NVARCHAR(50);
    DECLARE @notifTitle NVARCHAR(255);
    DECLARE @notifMessage NVARCHAR(MAX);
    
    WITH NotifTypes AS (SELECT value AS Type, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@notifTypes, ','))
    SELECT @notifType = Type FROM NotifTypes WHERE RN = @notifTypeIndex;
    
    WITH NotifTitles AS (SELECT value AS Title, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@notifTitles, ','))
    SELECT @notifTitle = Title FROM NotifTitles WHERE RN = @notifTitleIndex;
    
    WITH NotifMessages AS (SELECT value AS Message, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@notifMessages, ','))
    SELECT @notifMessage = Message FROM NotifMessages WHERE RN = @notifMessageIndex;
    
    SET IDENTITY_INSERT [dbo].[notifications] ON;
    INSERT INTO [dbo].[notifications] ([id], [userId], [type], [title], [message], [isRead], [createdAt])
    VALUES 
    (@notifCounter, @notifUserId, @notifType, @notifTitle, @notifMessage, IIF(RAND() > 0.5, 1, 0), DATEADD(DAY, -FLOOR(RAND() * 30), GETDATE()));
    SET IDENTITY_INSERT [dbo].[notifications] OFF;
    
    SET @notifCounter = @notifCounter + 1;
END
GO

PRINT 'Sample notifications inserted successfully!';
GO

-- =============================================================
-- Sample: Login History (100)
-- =============================================================
PRINT 'Inserting sample login history...';
GO

DECLARE @loginCounter INT = 1;
WHILE @loginCounter <= 100
BEGIN
    DECLARE @loginUserId INT = FLOOR(1 + RAND() * 100);
    INSERT INTO [dbo].[login_history] ([userId], [ipAddress], [deviceInfo], [browserInfo], [loginAt], [success], [createdAt], [updatedAt])
    VALUES 
    (@loginUserId, '192.168.' + CAST(FLOOR(1 + RAND() * 255) AS NVARCHAR(10)) + '.' + CAST(FLOOR(1 + RAND() * 255) AS NVARCHAR(10)), 'Windows 10', 'Chrome 125.0', DATEADD(DAY, -FLOOR(RAND() * 90), GETDATE()), 1, GETDATE(), GETDATE());
    SET @loginCounter = @loginCounter + 1;
END
GO

PRINT 'Sample login history inserted successfully!';
GO

-- =============================================================
-- Sample: User Activities (100)
-- =============================================================
PRINT 'Inserting sample user activities...';
GO

DECLARE @activityCounter INT = 1;
DECLARE @activityTypes NVARCHAR(MAX) = N'VIEW_PRODUCT,ADD_TO_CART,PURCHASE,ADD_TO_WISHLIST';

WHILE @activityCounter <= 100
BEGIN
    DECLARE @actUserId INT = FLOOR(3 + RAND() * 98);
    DECLARE @actTypeIndex INT = FLOOR(RAND() * (LEN(@activityTypes) - LEN(REPLACE(@activityTypes, ',', '')) + 1)) + 1;
    DECLARE @actType NVARCHAR(50);
    DECLARE @actProductId INT = FLOOR(1 + RAND() * 8);
    DECLARE @actOrderId INT = IIF(RAND() > 0.7, FLOOR(1 + RAND() * 100), NULL);
    
    WITH ActivityTypes AS (SELECT value AS Type, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@activityTypes, ','))
    SELECT @actType = Type FROM ActivityTypes WHERE RN = @actTypeIndex;
    
    SET IDENTITY_INSERT [dbo].[user_activities] ON;
    INSERT INTO [dbo].[user_activities] ([id], [userId], [activityType], [productId], [orderId], [details], [createdAt])
    VALUES 
    (@activityCounter, @actUserId, @actType, @actProductId, @actOrderId, N'{}', DATEADD(DAY, -FLOOR(RAND() * 60), GETDATE()));
    SET IDENTITY_INSERT [dbo].[user_activities] OFF;
    
    SET @activityCounter = @activityCounter + 1;
END
GO

PRINT 'Sample user activities inserted successfully!';
GO

-- =============================================================
-- Sample: Loyalty Points (100)
-- =============================================================
PRINT 'Inserting sample loyalty points...';
GO

DECLARE @lpCounter INT = 1;
WHILE @lpCounter <= 100
BEGIN
    DECLARE @lpUserId INT = FLOOR(3 + RAND() * 98);
    DECLARE @lpPoints INT = FLOOR(100 + RAND() * 1000);
    DECLARE @lpType NVARCHAR(20) = IIF(RAND() > 0.2, 'EARN', 'REDEEM');
    DECLARE @lpOrderId INT = IIF(RAND() > 0.5, FLOOR(1 + RAND() * 100), NULL);
    DECLARE @lpDesc NVARCHAR(255) = IIF(@lpType = 'EARN', N'Nhận điểm từ đơn hàng', N'Đổi điểm giảm giá');
    
    SET IDENTITY_INSERT [dbo].[loyalty_points] ON;
    INSERT INTO [dbo].[loyalty_points] ([id], [userId], [points], [type], [description], [orderId], [createdAt])
    VALUES 
    (@lpCounter, @lpUserId, @lpPoints, @lpType, @lpDesc, @lpOrderId, DATEADD(DAY, -FLOOR(RAND() * 60), GETDATE()));
    SET IDENTITY_INSERT [dbo].[loyalty_points] OFF;
    
    SET @lpCounter = @lpCounter + 1;
END
GO

PRINT 'Sample loyalty points inserted successfully!';
GO

-- =============================================================
-- Sample: Chat Sessions (100) & Chat Messages (500)
-- =============================================================
PRINT 'Inserting sample chat sessions and messages...';
GO

DECLARE @chatSessionCounter INT = 1;
DECLARE @chatMessageCounter INT = 1;
DECLARE @chatSubjects NVARCHAR(MAX) = N'Hỏi về sản phẩm,Hỏi về size,Hỏi về vận chuyển,Hỏi về đổi trả,Hỏi về khuyến mãi';

WHILE @chatSessionCounter <= 100
BEGIN
    -- Create chat session
    DECLARE @csCustomerId INT = FLOOR(3 + RAND() * 98);
    DECLARE @csStaffId INT = IIF(RAND() > 0.3, 2, NULL);
    DECLARE @csStatus NVARCHAR(50) = IIF(RAND() > 0.3, 'CLOSED', 'OPEN');
    DECLARE @csSubjectIndex INT = FLOOR(RAND() * (LEN(@chatSubjects) - LEN(REPLACE(@chatSubjects, ',', '')) + 1)) + 1;
    DECLARE @csSubject NVARCHAR(255);
    
    WITH ChatSubjects AS (SELECT value AS Subject, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@chatSubjects, ','))
    SELECT @csSubject = Subject FROM ChatSubjects WHERE RN = @csSubjectIndex;
    
    SET IDENTITY_INSERT [dbo].[chat_sessions] ON;
    INSERT INTO [dbo].[chat_sessions] ([id], [customerId], [staffId], [status], [subject], [createdAt], [updatedAt])
    VALUES 
    (@chatSessionCounter, @csCustomerId, @csStaffId, @csStatus, @csSubject, DATEADD(DAY, -FLOOR(RAND() * 30), GETDATE()), GETDATE());
    SET IDENTITY_INSERT [dbo].[chat_sessions] OFF;
    
    -- Add 3-8 messages
    DECLARE @msgCount INT = FLOOR(3 + RAND() * 6);
    DECLARE @msgIdx INT = 1;
    DECLARE @lastSender NVARCHAR(20) = 'USER';
    DECLARE @msgCreatedAt DATETIME = DATEADD(DAY, -FLOOR(RAND() * 30), GETDATE());
    
    WHILE @msgIdx <= @msgCount
    BEGIN
        DECLARE @msgContent NVARCHAR(MAX);
        DECLARE @msgSenderType NVARCHAR(20);
        
        IF @lastSender = 'USER'
        BEGIN
            SET @msgSenderType = IIF(RAND() > 0.2, 'STAFF', 'USER');
            IF @msgSenderType = 'STAFF' AND @csStaffId IS NULL
            BEGIN
                SET @msgSenderType = 'BOT';
            END
        END
        ELSE
        BEGIN
            SET @msgSenderType = 'USER';
        END
        
        SET @lastSender = @msgSenderType;
        
        -- Set message content
        IF @msgSenderType = 'USER'
        BEGIN
            DECLARE @userMsgs NVARCHAR(MAX) = N'Chào shop, cho em hỏi size này là bao nhiêu ạ?,Sản phẩm này còn hàng không ạ?,Giao hàng mất bao lâu ạ?,Em muốn đổi size được không ạ?,Có chương trình khuyến mãi nào không ạ?';
            DECLARE @userMsgIdx INT = FLOOR(RAND() * (LEN(@userMsgs) - LEN(REPLACE(@userMsgs, ',', '')) + 1)) + 1;
            WITH UserMsgs AS (SELECT value AS Msg, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@userMsgs, ','))
            SELECT @msgContent = Msg FROM UserMsgs WHERE RN = @userMsgIdx;
        END
        ELSE IF @msgSenderType = 'STAFF'
        BEGIN
            DECLARE @staffMsgs NVARCHAR(MAX) = N'Dạ vâng em, size này là size M ạ,Chào em, sản phẩm này còn hàng nhiều ạ,Giao hàng mất 3-5 ngày làm việc ạ,Em có thể đổi size trong vòng 7 ngày ạ,Hiện tại shop có chương trình giảm giá đến 50% ạ!';
            DECLARE @staffMsgIdx INT = FLOOR(RAND() * (LEN(@staffMsgs) - LEN(REPLACE(@staffMsgs, ',', '')) + 1)) + 1;
            WITH StaffMsgs AS (SELECT value AS Msg, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@staffMsgs, ','))
            SELECT @msgContent = Msg FROM StaffMsgs WHERE RN = @staffMsgIdx;
        END
        ELSE
        BEGIN
            DECLARE @botMsgs NVARCHAR(MAX) = N'Xin chào! Tôi là bot hỗ trợ của Vixxy. Rất vui được phục vụ bạn!,Xin vui lòng chờ, chúng tôi sẽ kết nối bạn với nhân viên hỗ trợ sớm nhất!';
            DECLARE @botMsgIdx INT = FLOOR(RAND() * (LEN(@botMsgs) - LEN(REPLACE(@botMsgs, ',', '')) + 1)) + 1;
            WITH BotMsgs AS (SELECT value AS Msg, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RN FROM STRING_SPLIT(@botMsgs, ','))
            SELECT @msgContent = Msg FROM BotMsgs WHERE RN = @botMsgIdx;
        END
        
        SET IDENTITY_INSERT [dbo].[chat_messages] ON;
        INSERT INTO [dbo].[chat_messages] ([id], [sessionId], [senderType], [senderId], [content], [isRead], [createdAt])
        VALUES 
        (@chatMessageCounter, @chatSessionCounter, @msgSenderType, IIF(@msgSenderType = 'USER', @csCustomerId, 2), @msgContent, IIF(RAND() > 0.3, 1, 0), @msgCreatedAt);
        SET IDENTITY_INSERT [dbo].[chat_messages] OFF;
        
        SET @chatMessageCounter = @chatMessageCounter + 1;
        SET @msgIdx = @msgIdx + 1;
        SET @msgCreatedAt = DATEADD(MINUTE, FLOOR(1 + RAND() * 30), @msgCreatedAt);
    END
    
    SET @chatSessionCounter = @chatSessionCounter + 1;
END
GO

PRINT 'Sample chat sessions and messages inserted successfully!';
GO

-- =============================================================
-- Sample: Inventory Reservations (100)
-- =============================================================
PRINT 'Inserting sample inventory reservations...';
GO

DECLARE @irCounter INT = 1;
WHILE @irCounter <= 100
BEGIN
    DECLARE @irProductId INT = FLOOR(1 + RAND() * 8);
    DECLARE @irQuantity INT = FLOOR(1 + RAND() * 5);
    INSERT INTO [dbo].[inventory_reservations] ([productId], [quantity], [expiresAt], [createdAt])
    VALUES 
    (@irProductId, @irQuantity, DATEADD(HOUR, FLOOR(1 + RAND() * 48), GETDATE()), GETDATE());
    SET @irCounter = @irCounter + 1;
END
GO

PRINT 'Sample inventory reservations inserted successfully!';
GO

PRINT '=';
PRINT 'All sample data inserted successfully!';
PRINT '=';
GO

-- =============================================================
-- Verify Sample Data
-- =============================================================
PRINT '=';
PRINT 'Database Summary:';
PRINT '=';

SELECT 'Users' AS [Table], COUNT(*) AS [Record Count] FROM [dbo].[users]
UNION ALL
SELECT 'Roles', COUNT(*) FROM [dbo].[roles]
UNION ALL
SELECT 'Categories', COUNT(*) FROM [dbo].[categories]
UNION ALL
SELECT 'Products', COUNT(*) FROM [dbo].[products]
UNION ALL
SELECT 'Product Images', COUNT(*) FROM [dbo].[product_images]
UNION ALL
SELECT 'Product Variants', COUNT(*) FROM [dbo].[product_variants]
UNION ALL
SELECT 'Addresses', COUNT(*) FROM [dbo].[addresses]
UNION ALL
SELECT 'Orders', COUNT(*) FROM [dbo].[orders]
UNION ALL
SELECT 'Order Details', COUNT(*) FROM [dbo].[order_details]
UNION ALL
SELECT 'Payments', COUNT(*) FROM [dbo].[payments]
UNION ALL
SELECT 'Payment Logs', COUNT(*) FROM [dbo].[payment_logs]
UNION ALL
SELECT 'Refund Requests', COUNT(*) FROM [dbo].[refund_requests]
UNION ALL
SELECT 'Shippings', COUNT(*) FROM [dbo].[shippings]
UNION ALL
SELECT 'Reviews', COUNT(*) FROM [dbo].[reviews]
UNION ALL
SELECT 'Banners', COUNT(*) FROM [dbo].[banners]
UNION ALL
SELECT 'Vouchers', COUNT(*) FROM [dbo].[vouchers]
UNION ALL
SELECT 'Order Vouchers', COUNT(*) FROM [dbo].[order_vouchers]
UNION ALL
SELECT 'Wishlists', COUNT(*) FROM [dbo].[wishlists]
UNION ALL
SELECT 'Wishlist Items', COUNT(*) FROM [dbo].[wishlist_items]
UNION ALL
SELECT 'Carts', COUNT(*) FROM [dbo].[carts]
UNION ALL
SELECT 'Cart Items', COUNT(*) FROM [dbo].[cart_items]
UNION ALL
SELECT 'Notifications', COUNT(*) FROM [dbo].[notifications]
UNION ALL
SELECT 'Login History', COUNT(*) FROM [dbo].[login_history]
UNION ALL
SELECT 'User Activities', COUNT(*) FROM [dbo].[user_activities]
UNION ALL
SELECT 'Loyalty Points', COUNT(*) FROM [dbo].[loyalty_points]
UNION ALL
SELECT 'Chat Sessions', COUNT(*) FROM [dbo].[chat_sessions]
UNION ALL
SELECT 'Chat Messages', COUNT(*) FROM [dbo].[chat_messages]
UNION ALL
SELECT 'Inventory Reservations', COUNT(*) FROM [dbo].[inventory_reservations]
ORDER BY [Table];
GO

PRINT '=';
PRINT 'Database setup complete!';
PRINT '=';
GO  