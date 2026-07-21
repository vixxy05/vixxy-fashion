-- =============================================================
-- VIXXY D'ORANCE - Lab 8: E-Marketing Database Extension
-- Target DB: MySQL 8.x / MariaDB 10.5+
-- Purpose:
--   1. Marketing posts linked to product detail pages
--   2. Post groups/users and post actions: view, icon, comment, share
--   3. Product reviews and product purchase counters
--   4. User-admin chatbox history
-- =============================================================

USE vixxy_dorance;

-- =============================================================
-- 1. E-Marketing Post
-- =============================================================

CREATE TABLE IF NOT EXISTS post_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL UNIQUE,
  description TEXT,
  owner_user_id INT,
  visibility ENUM('public', 'private', 'internal') NOT NULL DEFAULT 'public',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_post_groups_owner
    FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_post_groups_visibility (visibility),
  INDEX idx_post_groups_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_group_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  user_id INT NOT NULL,
  member_role ENUM('owner', 'admin', 'editor', 'viewer') NOT NULL DEFAULT 'viewer',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_post_group_members_group
    FOREIGN KEY (group_id) REFERENCES post_groups(id) ON DELETE CASCADE,
  CONSTRAINT fk_post_group_members_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_post_group_user (group_id, user_id),
  INDEX idx_post_group_members_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS marketing_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT,
  author_user_id INT,
  product_id INT,
  title VARCHAR(180) NOT NULL,
  content TEXT NOT NULL,
  public_link VARCHAR(500),
  thumbnail_url VARCHAR(500),
  cover_url VARCHAR(500),
  status ENUM('draft', 'scheduled', 'published', 'archived') NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_marketing_posts_group
    FOREIGN KEY (group_id) REFERENCES post_groups(id) ON DELETE SET NULL,
  CONSTRAINT fk_marketing_posts_author
    FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_marketing_posts_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_marketing_posts_status (status),
  INDEX idx_marketing_posts_product (product_id),
  INDEX idx_marketing_posts_published_at (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 2. Post Action: View, Icon, Comment, Share
-- =============================================================

CREATE TABLE IF NOT EXISTS post_views (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT,
  session_id VARCHAR(120),
  ip_address VARCHAR(64),
  user_agent VARCHAR(500),
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_post_views_post
    FOREIGN KEY (post_id) REFERENCES marketing_posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_post_views_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_post_views_post_time (post_id, viewed_at),
  INDEX idx_post_views_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_icons (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  icon_type ENUM('like', 'love', 'wow', 'sad', 'angry') NOT NULL DEFAULT 'like',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_post_icons_post
    FOREIGN KEY (post_id) REFERENCES marketing_posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_post_icons_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_post_icon_user (post_id, user_id),
  INDEX idx_post_icons_type (icon_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_comments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT,
  parent_comment_id BIGINT,
  content TEXT NOT NULL,
  status ENUM('visible', 'hidden', 'deleted') NOT NULL DEFAULT 'visible',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_post_comments_post
    FOREIGN KEY (post_id) REFERENCES marketing_posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_post_comments_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_post_comments_parent
    FOREIGN KEY (parent_comment_id) REFERENCES post_comments(id) ON DELETE CASCADE,
  INDEX idx_post_comments_post (post_id, created_at),
  INDEX idx_post_comments_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_shares (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT,
  channel ENUM('facebook', 'messenger', 'zalo', 'copy_link', 'email', 'other') NOT NULL DEFAULT 'copy_link',
  shared_url VARCHAR(500),
  shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_post_shares_post
    FOREIGN KEY (post_id) REFERENCES marketing_posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_post_shares_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_post_shares_post_time (post_id, shared_at),
  INDEX idx_post_shares_channel (channel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional summary table for fast admin dashboard reporting.
CREATE TABLE IF NOT EXISTS post_metrics (
  post_id INT PRIMARY KEY,
  view_count BIGINT NOT NULL DEFAULT 0,
  icon_count BIGINT NOT NULL DEFAULT 0,
  comment_count BIGINT NOT NULL DEFAULT 0,
  share_count BIGINT NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_post_metrics_post
    FOREIGN KEY (post_id) REFERENCES marketing_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 3. Product Review + Customer Purchase Count
-- =============================================================

CREATE TABLE IF NOT EXISTS product_reviews (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT,
  order_id INT,
  rating TINYINT NOT NULL,
  title VARCHAR(180),
  content TEXT,
  image_url VARCHAR(500),
  status ENUM('pending', 'approved', 'rejected', 'hidden') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_reviews_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_product_reviews_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_product_reviews_order
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  CONSTRAINT chk_product_reviews_rating CHECK (rating BETWEEN 1 AND 5),
  UNIQUE KEY uk_review_user_order_product (user_id, order_id, product_id),
  INDEX idx_product_reviews_product_status (product_id, status),
  INDEX idx_product_reviews_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_stats (
  product_id INT PRIMARY KEY,
  purchased_customer_count INT NOT NULL DEFAULT 0,
  purchased_quantity_total INT NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  average_rating DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_stats_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 4. Chatbox: User <-> Admin History
-- =============================================================

CREATE TABLE IF NOT EXISTS chat_conversations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_user_id INT,
  assigned_admin_user_id INT,
  subject VARCHAR(180),
  status ENUM('open', 'assigned', 'closed') NOT NULL DEFAULT 'open',
  last_message_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_customer
    FOREIGN KEY (customer_user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_chat_admin
    FOREIGN KEY (assigned_admin_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_chat_customer (customer_user_id),
  INDEX idx_chat_admin_status (assigned_admin_user_id, status),
  INDEX idx_chat_last_message (last_message_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  conversation_id BIGINT NOT NULL,
  sender_user_id INT,
  sender_type ENUM('user', 'admin', 'system', 'bot') NOT NULL,
  message_type ENUM('text', 'image', 'file', 'product_link', 'order_link') NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  attachment_url VARCHAR(500),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_messages_conversation
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_messages_sender
    FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_chat_messages_conversation_time (conversation_id, created_at),
  INDEX idx_chat_messages_sender (sender_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 5. Sample Data
-- Replace IDs if your products/users differ.
-- =============================================================

INSERT INTO post_groups (id, name, slug, description, visibility)
VALUES
(1, 'VIXXY Official Campaigns', 'vixxy-official-campaigns', 'Official marketing posts for campaigns and product launches.', 'public')
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);

INSERT INTO marketing_posts (
  id, group_id, author_user_id, product_id, title, content,
  public_link, thumbnail_url, cover_url, status, published_at
) VALUES
(1, 1, 1, 1,
 'Crystal Falls Couture Gown - Launch Post',
 'Khám phá Crystal Falls Couture Gown: thiết kế couture sequin tím lavender dành cho dạ tiệc cao cấp. Nhấn vào link để xem chi tiết sản phẩm.',
 '/products/1',
 '/images/crystal-falls-gown.png',
 '/images/banner.png',
 'published',
 CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  content = VALUES(content),
  public_link = VALUES(public_link),
  status = VALUES(status);

INSERT INTO post_metrics (post_id, view_count, icon_count, comment_count, share_count, last_activity_at)
VALUES (1, 125, 34, 8, 12, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE
  view_count = VALUES(view_count),
  icon_count = VALUES(icon_count),
  comment_count = VALUES(comment_count),
  share_count = VALUES(share_count),
  last_activity_at = VALUES(last_activity_at);

INSERT INTO product_reviews (product_id, user_id, order_id, rating, title, content, status)
VALUES
(1, 1, NULL, 5, 'Rất sang và nổi bật', 'Chất vải đẹp, form tôn dáng, phù hợp tiệc tối.', 'approved'),
(1, NULL, NULL, 4, 'Đẹp như ảnh', 'Màu lavender bắt sáng tốt, giao diện sản phẩm dễ xem.', 'approved');

INSERT INTO product_stats (product_id, purchased_customer_count, purchased_quantity_total, review_count, average_rating)
VALUES
(1, 18, 24, 2, 4.50)
ON DUPLICATE KEY UPDATE
  purchased_customer_count = VALUES(purchased_customer_count),
  purchased_quantity_total = VALUES(purchased_quantity_total),
  review_count = VALUES(review_count),
  average_rating = VALUES(average_rating);

INSERT INTO chat_conversations (id, customer_user_id, assigned_admin_user_id, subject, status, last_message_at)
VALUES
(1, 1, NULL, 'Tư vấn size và chính sách đổi hàng', 'open', CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE
  subject = VALUES(subject),
  status = VALUES(status),
  last_message_at = VALUES(last_message_at);

INSERT INTO chat_messages (conversation_id, sender_user_id, sender_type, message_type, content)
VALUES
(1, 1, 'user', 'text', 'Mình cao 1m62 nặng 50kg thì mặc size nào của Crystal Falls Couture Gown?'),
(1, NULL, 'bot', 'text', 'Bạn có thể tham khảo size S hoặc M tùy số đo vòng ngực/eO. Admin sẽ hỗ trợ chi tiết hơn.'),
(1, NULL, 'admin', 'text', 'Chào bạn, với thông tin này shop gợi ý size S nếu bạn thích form ôm, size M nếu muốn thoải mái hơn.');

-- =============================================================
-- 6. Useful Reporting Queries
-- =============================================================

-- Post performance for admin dashboard
-- SELECT p.id, p.title, p.public_link, m.view_count, m.icon_count, m.comment_count, m.share_count
-- FROM marketing_posts p
-- LEFT JOIN post_metrics m ON m.post_id = p.id
-- WHERE p.status = 'published'
-- ORDER BY p.published_at DESC;

-- Product card extra info: purchase count + reviews
-- SELECT p.id, p.name, s.purchased_customer_count, s.average_rating, s.review_count
-- FROM products p
-- LEFT JOIN product_stats s ON s.product_id = p.id
-- WHERE p.is_active = TRUE;

-- Admin chatbox list
-- SELECT c.id, c.subject, c.status, c.last_message_at, u.full_name AS customer_name
-- FROM chat_conversations c
-- LEFT JOIN users u ON u.id = c.customer_user_id
-- ORDER BY c.last_message_at DESC;
