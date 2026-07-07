
# Phase 2: System Analysis - VIXXY D'ORANCE
## 01. System Context Diagram

## External Systems
1. **Customer** - End users browsing and purchasing products
2. **Admin User** - Platform administrators managing products, orders, etc.
3. **Payment Gateways** - Momo, ZaloPay, VNPay, Visa, Mastercard
4. **Shipping Providers** - GHN, GHTK, Viettel Post
5. **Email Service** - Gmail, SendGrid for email notifications
6. **Cloud Storage** - AWS S3, Cloudinary for product images

## Subsystems
1. **Frontend Store** - Next.js/React app for customers
2. **Admin Dashboard** - React/Next.js app for admins
3. **Backend API** - Express.js API handling business logic
4. **Database** - MySQL for data persistence
5. **Cache** - Redis for performance optimization
6. **Chat Service** - WebSocket-based real-time chat
