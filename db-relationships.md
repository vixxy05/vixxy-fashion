# VIXXY D'ORANCE Authentication Database - Relationships Explanation

## 1. Overview
The authentication database is designed to be **3NF (Third Normal Form)** compliant, with clear relationships between tables, proper constraints, and indexes for performance!

## 2. Table Relationships Breakdown

### 2.1. Users ↔ Roles (Many-to-Many)
- **Tables Involved**: Users, UserRoles, Roles
- **Relationship Type**: Many-to-Many (A user can have multiple roles; a role can be assigned to multiple users)
- **Junction Table**: UserRoles
- **Foreign Keys**:
  - UserRoles.userId → Users.id (ON DELETE CASCADE: when a user is deleted, their role assignments are also deleted)
  - UserRoles.roleId → Roles.id (ON DELETE CASCADE: when a role is deleted, all assignments of that role are deleted)
- **Unique Constraint**: UserRoles (userId, roleId) – Prevents assigning the same role to the same user more than once
- **Indexes**: 
  - idx_user_roles_user (userId): Optimize queries like "find all roles for user X"
  - idx_user_roles_role (roleId): Optimize queries like "find all users with role Y"

### 2.2. Roles ↔ Permissions (Many-to-Many)
- **Tables Involved**: Roles, RolePermissions, Permissions
- **Relationship Type**: Many-to-Many (A role can have multiple permissions; a permission can be assigned to multiple roles)
- **Junction Table**: RolePermissions
- **Foreign Keys**:
  - RolePermissions.roleId → Roles.id (ON DELETE CASCADE)
  - RolePermissions.permissionId → Permissions.id (ON DELETE CASCADE)
- **Unique Constraint**: RolePermissions (roleId, permissionId) – Prevents assigning the same permission to the same role more than once
- **Indexes**:
  - idx_role_permissions_role (roleId): Optimize queries like "find all permissions for role X"
  - idx_role_permissions_permission (permissionId): Optimize queries like "find all roles with permission Y"

### 2.3. Users ↔ RefreshTokens (One-to-Many)
- **Tables Involved**: Users, RefreshTokens
- **Relationship Type**: One-to-Many (One user can have multiple refresh tokens, one per device/session)
- **Foreign Key**: RefreshTokens.userId → Users.id (ON DELETE CASCADE: when a user is deleted, all their refresh tokens are also deleted)
- **Unique Constraint**: RefreshTokens.token – Each refresh token must be unique across the system
- **Indexes**:
  - idx_refresh_token (token): Quickly look up a token's details
  - idx_refresh_user (userId): Find all tokens for a user (for revoking all tokens)
  - idx_refresh_expires (expiresAt): Optimize cleaning up expired tokens

### 2.4. Users ↔ LoginHistory (One-to-Many)
- **Tables Involved**: Users, LoginHistory
- **Relationship Type**: One-to-Many (One user can have many login attempts)
- **Foreign Key**: LoginHistory.userId → Users.id (ON DELETE SET NULL: Keep login history for auditing even if the user is deleted)
- **Indexes**:
  - idx_login_user (userId): Find all login attempts for a specific user
  - idx_login_time (loginAt): Find login attempts in a date range
  - idx_login_success (success): Filter successful/failed login attempts

## 3. Key Design Decisions
### 3.1. 3NF Compliance
- All non-key attributes depend only on the primary key
- No transitive dependencies (e.g., permissions are not stored directly in Roles table)
- Reduced data duplication (using junction tables for many-to-many relationships)

### 3.2. Cascade Delete Strategy
- **UserRoles, RolePermissions, RefreshTokens**: Use `ON DELETE CASCADE` – when parent is deleted, children are also deleted (cleanup)
- **LoginHistory**: Use `ON DELETE SET NULL` – keep audit logs even if user is deleted

### 3.3. Unique Constraints
- Roles.roleName: Ensure unique role names
- Users.email, Users.phone, Users.username: Unique identifiers for user login
- Permissions.permissionCode: Unique machine-readable permission codes
- Junction tables: Prevent duplicate assignments

### 3.4. Index Strategy
- Index all foreign keys for faster joins
- Index frequently filtered columns (status, success, expiresAt)
- Index unique columns (email, token, etc.) for faster lookups
