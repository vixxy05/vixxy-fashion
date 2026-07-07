-- ================================================
-- VIXXY D'ORANCE Authentication Database
-- ================================================
-- Database: vixxy_auth
-- Engine: MySQL 8.0+
-- Normalization: 3NF
-- ================================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS vixxy_auth
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE vixxy_auth;

-- ================================================
-- Table 1: Roles
-- Stores role definitions for the system
-- ================================================
CREATE TABLE IF NOT EXISTS Roles (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for role',
    roleName VARCHAR(50) NOT NULL UNIQUE COMMENT 'Name of the role (e.g., SUPER_ADMIN, ADMIN, STAFF, CUSTOMER)',
    description TEXT COMMENT 'Description of what the role can do',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role_name (roleName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Table 2: Users
-- Stores user account information
-- ================================================
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique user ID',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT 'User email for login',
    phone VARCHAR(20) UNIQUE COMMENT 'User phone number',
    username VARCHAR(50) UNIQUE COMMENT 'Unique username for the user',
    passwordHash VARCHAR(255) NOT NULL COMMENT 'Hashed password (bcrypt recommended)',
    fullName VARCHAR(255) NOT NULL COMMENT 'User full name',
    avatar VARCHAR(255) COMMENT 'Avatar/profile picture URL',
    status ENUM('active', 'inactive', 'banned') NOT NULL DEFAULT 'active' COMMENT 'Account status',
    emailVerified BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Is email verified?',
    phoneVerified BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Is phone number verified?',
    lastLoginAt DATETIME COMMENT 'Timestamp of last successful login',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Table 3: Permissions
-- Stores granular permission definitions
-- ================================================
CREATE TABLE IF NOT EXISTS Permissions (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique permission ID',
    permissionCode VARCHAR(100) NOT NULL UNIQUE COMMENT 'Machine-readable permission code (e.g., CREATE_ORDER, VIEW_PRODUCTS)',
    permissionName VARCHAR(255) NOT NULL COMMENT 'Human-readable permission name',
    description TEXT COMMENT 'Permission description',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_permission_code (permissionCode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Table 4: UserRoles
-- Many-to-many relationship between Users and Roles
-- A user can have multiple roles; a role can be assigned to multiple users
-- ================================================
CREATE TABLE IF NOT EXISTS UserRoles (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique ID for this assignment',
    userId INT NOT NULL COMMENT 'Reference to user',
    roleId INT NOT NULL COMMENT 'Reference to role',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_role (userId, roleId) COMMENT 'Prevent duplicate role assignments to same user',
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (roleId) REFERENCES Roles(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_user_roles_user (userId),
    INDEX idx_user_roles_role (roleId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Table 5: RolePermissions
-- Many-to-many relationship between Roles and Permissions
-- A role can have multiple permissions; a permission can be assigned to multiple roles
-- ================================================
CREATE TABLE IF NOT EXISTS RolePermissions (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique ID for this assignment',
    roleId INT NOT NULL COMMENT 'Reference to role',
    permissionId INT NOT NULL COMMENT 'Reference to permission',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_role_permission (roleId, permissionId) COMMENT 'Prevent duplicate permission assignments to same role',
    FOREIGN KEY (roleId) REFERENCES Roles(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (permissionId) REFERENCES Permissions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_role_permissions_role (roleId),
    INDEX idx_role_permissions_permission (permissionId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Table 6: RefreshTokens
-- Stores refresh tokens for JWT authentication
-- ================================================
CREATE TABLE IF NOT EXISTS RefreshTokens (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique token ID',
    userId INT NOT NULL COMMENT 'Reference to user who owns this token',
    token VARCHAR(255) NOT NULL UNIQUE COMMENT 'Refresh token string',
    expiresAt DATETIME NOT NULL COMMENT 'When this token expires',
    revoked BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Is this token revoked?',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_refresh_token (token),
    INDEX idx_refresh_user (userId),
    INDEX idx_refresh_expires (expiresAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Table 7: LoginHistory
-- Tracks all login attempts for auditing and security
-- ================================================
CREATE TABLE IF NOT EXISTS LoginHistory (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique login attempt ID',
    userId INT COMMENT 'Reference to user (NULL if user not found)',
    ipAddress VARCHAR(50) COMMENT 'IP address of login attempt',
    deviceInfo TEXT COMMENT 'Information about user device',
    browserInfo TEXT COMMENT 'Information about user browser',
    loginAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When login attempt happened',
    success BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Was login successful?',
    failureReason VARCHAR(255) COMMENT 'Reason for login failure (if applicable)',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_login_user (userId),
    INDEX idx_login_time (loginAt),
    INDEX idx_login_success (success)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Insert initial data
-- ================================================
-- Insert default roles
INSERT INTO Roles (roleName, description) VALUES
('SUPER_ADMIN', 'Full access to all system features'),
('ADMIN', 'Manage store operations, products, and users'),
('STAFF', 'Manage orders and customer support'),
('CUSTOMER', 'Browse products, place orders, manage account');

-- Insert initial permissions
INSERT INTO Permissions (permissionCode, permissionName, description) VALUES
-- Product-related
('VIEW_PRODUCTS', 'View Products', 'View all products in the store'),
('CREATE_PRODUCT', 'Create Product', 'Add new products to the store'),
('UPDATE_PRODUCT', 'Update Product', 'Edit existing product information'),
('DELETE_PRODUCT', 'Delete Product', 'Remove products from the store'),
-- Order-related
('VIEW_ORDERS', 'View Orders', 'View all orders in the system'),
('CREATE_ORDER', 'Create Order', 'Place new orders'),
('UPDATE_ORDER', 'Update Order', 'Edit order information and status'),
('DELETE_ORDER', 'Delete Order', 'Remove orders from the system'),
-- User-related
('VIEW_USERS', 'View Users', 'View all user accounts'),
('CREATE_USER', 'Create User', 'Add new user accounts'),
('UPDATE_USER', 'Update User', 'Edit existing user information'),
('DELETE_USER', 'Delete User', 'Remove user accounts'),
-- Payment-related
('MANAGE_PAYMENTS', 'Manage Payments', 'Handle payment gateways and transactions'),
-- Report-related
('VIEW_REPORTS', 'View Reports', 'View sales and analytics reports'),
-- Role/Permission-related
('MANAGE_ROLES', 'Manage Roles & Permissions', 'Create, edit, and assign roles and permissions');

-- Assign all permissions to SUPER_ADMIN
INSERT INTO RolePermissions (roleId, permissionId)
SELECT 1, id FROM Permissions;

-- Assign relevant permissions to ADMIN
INSERT INTO RolePermissions (roleId, permissionId)
SELECT 2, id FROM Permissions
WHERE permissionCode IN (
  'VIEW_PRODUCTS', 'CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT',
  'VIEW_ORDERS', 'CREATE_ORDER', 'UPDATE_ORDER', 'DELETE_ORDER',
  'VIEW_USERS', 'UPDATE_USER', 'MANAGE_PAYMENTS', 'VIEW_REPORTS'
);

-- Assign relevant permissions to STAFF
INSERT INTO RolePermissions (roleId, permissionId)
SELECT 3, id FROM Permissions
WHERE permissionCode IN (
  'VIEW_ORDERS', 'UPDATE_ORDER', 'VIEW_PRODUCTS'
);

-- Assign relevant permissions to CUSTOMER
INSERT INTO RolePermissions (roleId, permissionId)
SELECT 4, id FROM Permissions
WHERE permissionCode IN (
  'VIEW_PRODUCTS', 'CREATE_ORDER'
);

-- Insert test users (passwords are hashes of "admin123" using bcrypt rounds=10)
INSERT INTO Users (email, passwordHash, fullName, phone, status, emailVerified, phoneVerified) VALUES
('superadmin@vixxy.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoe6/Gt5Xn1wS8gW7p4O', 'Super Admin', '0987654321', 'active', 1, 1),
('admin@vixxy.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoe6/Gt5Xn1wS8gW7p4O', 'Store Admin', '0911223344', 'active', 1, 1),
('staff@vixxy.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoe6/Gt5Xn1wS8gW7p4O', 'Staff Support', '0912345678', 'active', 1, 1),
('user@vixxy.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoe6/Gt5Xn1wS8gW7p4O', 'Nguyen Van A', '0901234567', 'active', 1, 1);

-- Assign roles to test users
INSERT INTO UserRoles (userId, roleId) VALUES
(1, 1), -- Super Admin
(2, 2), -- Admin
(3, 3), -- Staff
(4, 4); -- Customer
