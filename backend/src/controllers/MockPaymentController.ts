
import { Request, Response } from "express";
import db from "../models";
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { io } from "../socket/socketServer";
import { successResponse, errorResponse } from "../utils/response";

export class MockPaymentController {
  // API 1: Tạo đơn hàng (kept for backwards compatibility, but orderRoutes handles it)
  static async createOrder(req: Request, res: Response) {
    try {
      console.log("========== CREATE ORDER ==========");
      console.log(req.body);
      console.log("==================================");

      const userId = (req as any).user?.id || 1; // Mock user for demo
      console.log("User ID:", userId);

      const { paymentMethod, shippingAddress, totalAmount } = req.body;

      const createdOrder = await db.Order.create({
        userId,
        totalAmount,
        shippingName: "Mock Name",
        shippingPhone: "0000000000",
        shippingAddress,
        shippingCity: "Mock City",
        orderStatus: "pending"
      });
      
      await db.Payment.create({
        orderId: createdOrder.id,
        userId,
        paymentMethod: paymentMethod || "MOCK_QR",
        amount: totalAmount,
        currency: "VND",
        paymentStatus: "PENDING"
      });

      console.log("Order created successfully:", createdOrder);

      return successResponse(res, {
        orderId: createdOrder.id,
      });
    } catch (error) {
      console.error("CREATE ORDER ERROR");
      console.error(error);

      return errorResponse(res, (error as Error).message, [], 500);
    }
  }

  // API 2: Tạo QR
  static async createQrPayment(req: Request, res: Response) {
    try {
      const { orderId } = req.body;
      const order = await db.Order.findByPk(orderId);
      if (!order) throw new Error("Order not found");
      
      let payment = await db.Payment.findOne({ where: { orderId } });
      if (!payment) {
        const transactionId = uuidv4();
        payment = await db.Payment.create({
          orderId,
          userId: order.userId,
          paymentMethod: "MOCK_QR",
          amount: order.totalAmount,
          currency: "VND",
          paymentStatus: "PENDING",
          transactionId
        });
      }
      
      // Create payment log (if we have PaymentLog model)
      if (db.PaymentLog) {
        await db.PaymentLog.create({
          paymentId: payment.id,
          logType: "REQUEST",
          requestData: JSON.stringify({ orderId })
        });
      }
      
      const paymentUrl = `${env.frontendUrl}/payment/mock?orderId=${orderId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(paymentUrl);
      
      await payment.update({
        qrCodeUrl: qrCodeDataUrl,
        paymentUrl
      });

      return successResponse(res, { paymentUrl, qrCode: qrCodeDataUrl });
    } catch (error) {
      return errorResponse(res, (error as Error).message, [], 500);
    }
  }

  // API 3: Lấy trạng thái Payment
  static async getPaymentStatus(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const payment = await db.Payment.findOne({
        where: { orderId },
      });
      const paymentStatus = payment ? payment.paymentStatus : null;
      return successResponse(res, { paymentStatus });
    } catch (error) {
      return errorResponse(res, (error as Error).message, [], 500);
    }
  }

  // API 4: Thanh toán thành công Mock
  static async mockPaymentSuccess(req: Request, res: Response) {
    try {
      const { orderId } = req.body;
      const payment = await db.Payment.findOne({ where: { orderId } });
      if (!payment) throw new Error("Payment not found");
      if (payment.paymentStatus === "SUCCESS") throw new Error("Order already paid");

      await payment.update({
        paymentStatus: "SUCCESS",
        paidAt: new Date()
      });
      
      // Update order status
      const order = await db.Order.findByPk(orderId);
      if (order) {
        await order.update({ orderStatus: "paid" });
      }
      
      // Create payment log if model exists
      if (db.PaymentLog) {
        await db.PaymentLog.create({
          paymentId: payment.id,
          logType: "CALLBACK",
          requestData: JSON.stringify({ orderId })
        });
      }
      
      io.emit("payment-success", { orderId });
      return successResponse(res, { success: true });
    } catch (error) {
      return errorResponse(res, (error as Error).message, [], 500);
    }
  }

  static async getAllPayments(req: Request, res: Response) {
    try {
      const payments = await db.Payment.findAll({
        include: [{ model: db.Order, as: "order" }],
        order: [["createdAt", "DESC"]]
      });
      return successResponse(res, payments);
    } catch (error) {
      return errorResponse(res, (error as Error).message, [], 500);
    }
  }
}

export default MockPaymentController;

