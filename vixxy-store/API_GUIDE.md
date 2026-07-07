# HƯỚNG DẪN SỬ DỤNG API - VIXXY D'ORANCE (ĐỒ ÁN THƯƠNG MẠI ĐIỆN TỬ)

Tài liệu này hướng dẫn sử dụng các API Mock (giả lập) cho dự án thương mại điện tử VIXXY D'ORANCE, bao gồm:
- API Thanh toán (MoMo & ZaloPay)
- API Vận chuyển (GHTK)
- API Đơn hàng

---

## Cấu trúc thư mục API
```
app/api/
├── orders/
│   └── route.ts          # CRUD đơn hàng
├── payment/
│   ├── momo/
│   │   ├── route.ts      # Tạo đơn MoMo
│   │   └── webhook/
│   │       └── route.ts  # Webhook MoMo (giả lập)
│   └── zalopay/
│       ├── route.ts      # Tạo đơn ZaloPay
│       └── webhook/
│           └── route.ts  # Webhook ZaloPay (giả lập)
└── shipping/
    └── ghtk/
        ├── fee/
        │   └── route.ts  # Tính phí vận chuyển
        ├── order/
        │   └── route.ts  # Tạo đơn vận chuyển
        └── tracking/
            └── route.ts  # Tracking đơn hàng
```

---

## 1. API Thanh toán

### 1.1 Tạo đơn MoMo
- **Endpoint**: `POST /api/payment/momo`
- **Body**:
  ```json
  {
    "orderId": "VX123456789",
    "amount": 500000,
    "orderInfo": "Thanh toán đơn hàng VIXXY D'ORANCE",
    "redirectUrl": "http://localhost:3000/checkout/success"
  }
  ```
- **Response**:
  ```json
  {
    "status": 200,
    "message": "Tạo đơn thành công",
    "payUrl": "http://localhost:3000/api/payment/momo/simulate-payment?orderId=VX123456789&amount=500000"
  }
  ```

### 1.2 Tạo đơn ZaloPay
- **Endpoint**: `POST /api/payment/zalopay`
- **Body**:
  ```json
  {
    "orderId": "VX123456789",
    "amount": 500000,
    "orderInfo": "Thanh toán đơn hàng VIXXY D'ORANCE"
  }
  ```

---

## 2. API Vận chuyển (GHTK)

### 2.1 Tính phí vận chuyển
- **Endpoint**: `POST /api/shipping/ghtk/fee`
- **Body**:
  ```json
  {
    "pickProvince": "HCM",
    "pickDistrict": "Quận 1",
    "province": "Hà Nội",
    "district": "Quận Đống Đa",
    "weight": 0.5
  }
  ```
- **Response**:
  ```json
  {
    "fee": 30000,
    "expectedDelivery": "2-3 ngày"
  }
  ```

### 2.2 Tạo đơn vận chuyển
- **Endpoint**: `POST /api/shipping/ghtk/order`
- **Body**:
  ```json
  {
    "orderId": "VX123456789",
    "receiverName": "Nguyễn Văn A",
    "receiverPhone": "0901234567",
    "receiverAddress": "123 Đường ABC, Quận Đống Đa, Hà Nội",
    "products": [...],
    "total": 530000
  }
  ```
- **Response**:
  ```json
  {
    "trackingCode": "GHTK123456789",
    "status": "success"
  }
  ```

### 2.3 Tracking đơn hàng
- **Endpoint**: `GET /api/shipping/ghtk/tracking?trackingCode=GHTK123456789`

---

## 3. API Đơn hàng

### 3.1 Tạo đơn hàng
- **Endpoint**: `POST /api/orders`

### 3.2 Lấy danh sách đơn hàng
- **Endpoint**: `GET /api/orders`

### 3.3 Lấy chi tiết đơn hàng
- **Endpoint**: `GET /api/orders/[orderId]`
