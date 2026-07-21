# Lab 8: E-Marketing Firebase Design

Thiết kế này chạy song song với SQL. SQL phù hợp báo cáo/chuẩn hóa dữ liệu; Firebase phù hợp realtime cho User/Admin.

## Collections

### `postGroups/{groupId}`
```js
{
  name: "VIXXY Official Campaigns",
  slug: "vixxy-official-campaigns",
  description: "Official marketing posts",
  ownerUserId: "adminUid",
  visibility: "public", // public | private | internal
  isActive: true,
  createdAt,
  updatedAt
}
```

Subcollection:
`postGroups/{groupId}/members/{userId}`
```js
{
  userId: "uid",
  memberRole: "admin", // owner | admin | editor | viewer
  joinedAt
}
```

### `marketingPosts/{postId}`
```js
{
  groupId: "groupId",
  authorUserId: "adminUid",
  productId: "productId",
  title: "Crystal Falls Couture Gown - Launch Post",
  content: "Nội dung bài viết E-Marketing...",
  publicLink: "/products/1",
  thumbnailUrl: "/images/crystal-falls-gown.png",
  coverUrl: "/images/banner.png",
  status: "published", // draft | scheduled | published | archived
  publishedAt,
  createdAt,
  updatedAt,
  metrics: {
    viewCount: 125,
    iconCount: 34,
    commentCount: 8,
    shareCount: 12
  }
}
```

Subcollections:

`marketingPosts/{postId}/views/{viewId}`
```js
{
  userId: "uid hoặc null",
  sessionId: "anonymous-session-id",
  ipHash: "optional",
  userAgent: "optional",
  viewedAt
}
```

`marketingPosts/{postId}/icons/{userId}`
```js
{
  userId: "uid",
  iconType: "like", // like | love | wow | sad | angry
  createdAt,
  updatedAt
}
```

`marketingPosts/{postId}/comments/{commentId}`
```js
{
  userId: "uid",
  parentCommentId: null,
  content: "Bài đẹp quá!",
  status: "visible", // visible | hidden | deleted
  createdAt,
  updatedAt
}
```

`marketingPosts/{postId}/shares/{shareId}`
```js
{
  userId: "uid hoặc null",
  channel: "copy_link", // facebook | messenger | zalo | copy_link | email | other
  sharedUrl: "/products/1",
  sharedAt
}
```

### `productReviews/{reviewId}`
```js
{
  productId: "productId",
  userId: "uid",
  orderId: "orderId hoặc null",
  rating: 5,
  title: "Rất sang và nổi bật",
  content: "Chất vải đẹp, form tôn dáng...",
  imageUrl: null,
  status: "approved", // pending | approved | rejected | hidden
  createdAt,
  updatedAt
}
```

### `productStats/{productId}`
```js
{
  productId: "productId",
  purchasedCustomerCount: 18,
  purchasedQuantityTotal: 24,
  reviewCount: 2,
  averageRating: 4.5,
  updatedAt
}
```

### `chatConversations/{conversationId}`
```js
{
  customerUserId: "uid",
  assignedAdminUserId: "adminUid hoặc null",
  subject: "Tư vấn size và chính sách đổi hàng",
  status: "open", // open | assigned | closed
  lastMessageAt,
  createdAt,
  updatedAt
}
```

Subcollection:
`chatConversations/{conversationId}/messages/{messageId}`
```js
{
  senderUserId: "uid hoặc null",
  senderType: "user", // user | admin | system | bot
  messageType: "text", // text | image | file | product_link | order_link
  content: "Mình cao 1m62 nặng 50kg thì mặc size nào?",
  attachmentUrl: null,
  isRead: false,
  createdAt
}
```

## Realtime Logic

- User xem trang chủ/detail sản phẩm:
  - subscribe `products`
  - subscribe `productStats/{productId}`
  - subscribe approved `productReviews` theo `productId`
- Admin dashboard:
  - subscribe `marketingPosts`
  - subscribe `productStats`
  - subscribe `chatConversations` order by `lastMessageAt desc`
- Khi Admin đăng post:
  - tạo `marketingPosts`
  - User thấy post/banner nếu `status == "published"`
- Khi User comment/share/icon:
  - ghi vào subcollection tương ứng
  - Cloud Function tăng `marketingPosts/{postId}.metrics`
- Khi User chat:
  - tạo hoặc cập nhật `chatConversations`
  - thêm message vào `messages`
  - Admin thấy realtime trong chatbox

## Suggested Cloud Functions

### `trackPostView(postId, sessionId)`
- Ghi view nếu session chưa view gần đây.
- Tăng `metrics.viewCount`.

### `reactToPost(postId, iconType)`
- Upsert `icons/{userId}`.
- Nếu reaction mới thì tăng `metrics.iconCount`.

### `commentOnPost(postId, content)`
- Tạo comment.
- Tăng `metrics.commentCount`.

### `sharePost(postId, channel)`
- Tạo share record.
- Tăng `metrics.shareCount`.

### `syncProductStatsAfterOrder(orderId)`
- Khi order paid/delivered:
  - cập nhật `purchasedCustomerCount`
  - cập nhật `purchasedQuantityTotal`

### `syncProductStatsAfterReview(productId)`
- Khi review approved:
  - cập nhật `reviewCount`
  - cập nhật `averageRating`

## Firestore Indexes

```json
[
  {
    "collectionGroup": "marketingPosts",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "status", "order": "ASCENDING" },
      { "fieldPath": "publishedAt", "order": "DESCENDING" }
    ]
  },
  {
    "collectionGroup": "productReviews",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "productId", "order": "ASCENDING" },
      { "fieldPath": "status", "order": "ASCENDING" },
      { "fieldPath": "createdAt", "order": "DESCENDING" }
    ]
  },
  {
    "collectionGroup": "chatConversations",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "assignedAdminUserId", "order": "ASCENDING" },
      { "fieldPath": "status", "order": "ASCENDING" },
      { "fieldPath": "lastMessageAt", "order": "DESCENDING" }
    ]
  }
]
```

## Basic Firestore Rules Draft

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return signedIn() && request.auth.token.role in ['admin', 'super_admin'];
    }

    match /marketingPosts/{postId} {
      allow read: if resource.data.status == 'published' || isAdmin();
      allow write: if isAdmin();

      match /views/{viewId} {
        allow create: if true;
        allow read: if isAdmin();
      }

      match /icons/{userId} {
        allow read: if true;
        allow write: if signedIn() && request.auth.uid == userId;
      }

      match /comments/{commentId} {
        allow read: if true;
        allow create: if signedIn();
        allow update, delete: if isAdmin();
      }

      match /shares/{shareId} {
        allow create: if true;
        allow read: if isAdmin();
      }
    }

    match /productReviews/{reviewId} {
      allow read: if resource.data.status == 'approved' || isAdmin();
      allow create: if signedIn();
      allow update, delete: if isAdmin();
    }

    match /productStats/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /chatConversations/{conversationId} {
      allow read, create: if signedIn();
      allow update: if isAdmin() || resource.data.customerUserId == request.auth.uid;

      match /messages/{messageId} {
        allow read, create: if signedIn();
        allow update: if isAdmin();
      }
    }
  }
}
```

## Mapping SQL to Firebase

| SQL table | Firebase path |
|---|---|
| `post_groups` | `postGroups/{groupId}` |
| `post_group_members` | `postGroups/{groupId}/members/{userId}` |
| `marketing_posts` | `marketingPosts/{postId}` |
| `post_views` | `marketingPosts/{postId}/views/{viewId}` |
| `post_icons` | `marketingPosts/{postId}/icons/{userId}` |
| `post_comments` | `marketingPosts/{postId}/comments/{commentId}` |
| `post_shares` | `marketingPosts/{postId}/shares/{shareId}` |
| `post_metrics` | `marketingPosts/{postId}.metrics` |
| `product_reviews` | `productReviews/{reviewId}` |
| `product_stats` | `productStats/{productId}` |
| `chat_conversations` | `chatConversations/{conversationId}` |
| `chat_messages` | `chatConversations/{conversationId}/messages/{messageId}` |
