
import { Request, Response } from "express";
import prismaServices from "../services/prisma.service";
import { io } from "../socket/socketServer";
import { successResponse, errorResponse } from "../utils/response";

const { order: orderService, payment: paymentService } = prismaServices;

export class MockPaymentController {
  // API 1: Tạo đơn hàng
  static async createOrder(req: Request, res: Response) {
    try {
      console.log("========== CREATE ORDER ==========");
      console.log(req.body);
      console.log("==================================");

      const userId = (req as any).user?.id || 1; // Mock user for demo
      console.log("User ID:", userId);

      const { paymentMethod, shippingAddress, totalAmount } = req.body;

      const { order, payment } = await orderService.createOrder(
        userId,
        paymentMethod,
        shippingAddress,
        totalAmount
      );

      console.log("Order created successfully:", order);
      console.log("Payment created successfully:", payment);

      return successResponse(res, {
        orderId: order.id,
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
      const { paymentUrl, qrCode } = await paymentService.createQrPayment(orderId);
      return successResponse(res, { paymentUrl, qrCode });
    } catch (error) {
      return errorResponse(res, (error as Error).message, [], 500);
    }
  }

  // API 3: Lấy trạng thái Payment
  static async getPaymentStatus(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const paymentStatus = await paymentService.getPaymentStatus(Number(Array.isArray(orderId) ? orderId[0] : orderId));
      return successResponse(res, { paymentStatus });
    } catch (error) {
      return errorResponse(res, (error as Error).message, [], 500);
    }
  }

  // API 4: Thanh toán thành công Mock
  static async mockPaymentSuccess(req: Request, res: Response) {
    try {
      const { orderId } = req.body;
      await paymentService.mockPaymentSuccess(orderId);
      io.emit("payment-success", { orderId });
      return successResponse(res, { success: true });
    } catch (error) {
      return errorResponse(res, (error as Error).message, [], 500);
    }
  }

  static async getAllPayments(req: Request, res: Response) {
    try {
      const payments = await paymentService.getAllPayments();
      return successResponse(res, payments);
    } catch (error) {
      return errorResponse(res, (error as Error).message, [], 500);
    }
  }
}

export default MockPaymentController;

