
import { Router } from "express";
import MockPaymentController from "../controllers/MockPaymentController";

const router = Router();

// API 1: Tạo đơn hàng
router.post("/orders", MockPaymentController.createOrder);
// API 2: Tạo QR Payment
router.post("/payments/create-qr", MockPaymentController.createQrPayment);
// API 3: Lấy trạng thái Payment
router.get("/payments/status/:orderId", MockPaymentController.getPaymentStatus);
// API 4: Thanh toán Mock Success
router.post("/payments/mock-success", MockPaymentController.mockPaymentSuccess);

router.get("/payments", MockPaymentController.getAllPayments);

export default router;

