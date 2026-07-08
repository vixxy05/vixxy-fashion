
import express from "express";
import PaymentController from "../controllers/paymentController";

const router = express.Router();

// Payment routes
router.post("/create", PaymentController.createPayment);
router.get("/:id", PaymentController.getPayment);
router.get("/history", PaymentController.getPaymentHistory);
router.get("/logs/:paymentId", PaymentController.getPaymentLogs);
router.post("/refund/:id", PaymentController.refundPayment);
router.post("/failed/:id", PaymentController.handleFailedPaymentEndpoint);
router.get("/dashboard/stats", PaymentController.getDashboardStats);

// Payment gateway callbacks
router.post("/callback/zalopay", PaymentController.zaloPayCallback);
router.post("/callback/momo", PaymentController.momoCallback);

export default router;
