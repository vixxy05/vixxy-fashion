
import { Request, Response } from "express";
import db from "../models";
import ZaloPayService from "../services/payment/zalopay.service";
import MoMoService from "../services/payment/momo.service";
import { emitToAll, emitToAdmins } from "../socket/socketServer";

const { Payment, PaymentLog, Order, Product, OrderDetail, InventoryReservation, OrderVoucher, Voucher } = db;

// Helper function to confirm inventory and deduct stock
const confirmPayment = async (paymentId: number, orderId: number) => {
  const transaction = await db.sequelize.transaction();
  try {
    const order = await Order.findByPk(orderId, { transaction });
    if (order) {
      await order.update({ orderStatus: "PAID" }, { transaction });

      const orderDetails = await OrderDetail.findAll({ where: { orderId: order.id }, transaction });
      for (const detail of orderDetails) {
        const product = await Product.findByPk(detail.productId, { transaction });
        if (product) {
          await product.update({
            stockQuantity: product.stockQuantity - detail.quantity,
          }, { transaction });
        }
      }

      // Confirm inventory reservations
      const reservations = await InventoryReservation.findAll({ where: { orderId: order.id }, transaction });
      for (const reservation of reservations) {
        await reservation.update({ status: "CONFIRMED" }, { transaction });
      }
    }

    await transaction.commit();
    emitToAll("order:paid", order);
    emitToAdmins("dashboard:update");
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Helper function to handle failed payment
const handleFailedPayment = async (paymentId: number, orderId: number) => {
  const transaction = await db.sequelize.transaction();
  try {
    const order = await Order.findByPk(orderId, { transaction });
    if (order) {
      await order.update({ orderStatus: "cancelled" }, { transaction });

      // Release inventory reservations
      const reservations = await InventoryReservation.findAll({ where: { orderId: order.id }, transaction });
      for (const reservation of reservations) {
        await reservation.update({ status: "RELEASED" }, { transaction });
      }

      // Restore voucher usage if applicable
      const orderVoucher = await OrderVoucher.findOne({ where: { orderId: order.id }, transaction });
      if (orderVoucher) {
        const voucher = await Voucher.findByPk(orderVoucher.voucherId, { transaction });
        if (voucher) {
          await voucher.update({ usedCount: Math.max(0, voucher.usedCount - 1) }, { transaction });
        }
      }
    }

    await transaction.commit();
    emitToAll("order:cancelled", order);
    emitToAdmins("dashboard:update");
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export class PaymentController {
  async createPayment(req: Request, res: Response) {
    try {
      const { orderId, paymentMethod, amount } = req.body;

      const order = await Order.findByPk(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      let paymentResult: any;

      if (paymentMethod === "COD") {
        const payment = await Payment.create({
          orderId,
          paymentMethod: "COD",
          amount,
          paymentStatus: "PENDING",
        });

        await order.update({ orderStatus: "PROCESSING" });

        paymentResult = {
          success: true,
          paymentId: payment.id,
          status: "PENDING",
        };
      } else if (paymentMethod === "ZALOPAY") {
        const zaloPayService = new ZaloPayService();
        paymentResult = await zaloPayService.createPayment(
          orderId,
          amount,
          `Thanh toan don hang ${orderId}`,
          `${process.env.FRONTEND_URL}/checkout/success?orderId=${orderId}`,
          `${process.env.BACKEND_URL}/api/payments/callback/zalopay`
        );
      } else if (paymentMethod === "MOMO") {
        const momoService = new MoMoService();
        paymentResult = await momoService.createPayment(
          orderId,
          amount,
          `Thanh toan don hang ${orderId}`,
          `${process.env.FRONTEND_URL}/checkout/success?orderId=${orderId}`,
          `${process.env.BACKEND_URL}/api/payments/callback/momo`
        );
      } else {
        return res.status(400).json({ success: false, message: "Invalid payment method" });
      }

      res.json({ success: true, ...paymentResult });
    } catch (error: any) {
      console.error("Error creating payment:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getPayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const payment = await Payment.findByPk(Number(Array.isArray(id) ? id[0] : id), {
        include: [{ model: Order, as: "order" }],
      });

      if (!payment) {
        return res.status(404).json({ success: false, message: "Payment not found" });
      }

      res.json({ success: true, data: payment });
    } catch (error: any) {
      console.error("Error getting payment:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getPaymentHistory(req: Request, res: Response) {
    try {
      const { userId } = req.query;

      const where: any = {};
      if (userId) where.userId = userId;

      const payments = await Payment.findAll({
        where,
        include: [{ model: Order, as: "order" }],
        order: [["createdAt", "DESC"]],
      });

      res.json({ success: true, data: payments });
    } catch (error: any) {
      console.error("Error getting payment history:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async zaloPayCallback(req: Request, res: Response) {
    try {
      const zaloPayService = new ZaloPayService();
      const { success, appTransId } = await zaloPayService.verifyCallback(req.body);

      if (!success) {
        return res.json({ return_code: -1, return_message: "Invalid signature" });
      }

      const payment = await Payment.findOne({ where: { requestId: appTransId } });
      if (!payment) {
        return res.json({ return_code: 0, return_message: "Payment not found" });
      }

      await payment.update({
        paymentStatus: "SUCCESS",
        paidAt: new Date(),
      });

      await confirmPayment(payment.id, payment.orderId);

      res.json({ return_code: 1, return_message: "Success" });
    } catch (error: any) {
      console.error("Error handling ZaloPay callback:", error);
      res.json({ return_code: 0, return_message: error.message });
    }
  }

  async momoCallback(req: Request, res: Response) {
    try {
      const momoService = new MoMoService();
      const { success, requestId, transactionId } = await momoService.verifyCallback(req.body);

      if (!success) {
        return res.status(400).json({ success: false, message: "Invalid signature" });
      }

      const payment = await Payment.findOne({ where: { requestId } });
      if (!payment) {
        return res.json({ success: false, message: "Payment not found" });
      }

      // Since verifyCallback returns success=true only when valid, assume SUCCESS here
      await payment.update({
        paymentStatus: "SUCCESS",
        transactionId,
        paidAt: new Date(),
      });

      await confirmPayment(payment.id, payment.orderId);

      res.json({ success: true, message: "Callback processed" });
    } catch (error: any) {
      console.error("Error handling MoMo callback:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // New endpoint to handle failed payment
  async handleFailedPaymentEndpoint(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const payment = await Payment.findByPk(Number(Array.isArray(id) ? id[0] : id));
      if (!payment) {
        return res.status(404).json({ success: false, message: "Payment not found" });
      }

      await payment.update({ paymentStatus: "FAILED" });
      await handleFailedPayment(payment.id, payment.orderId);

      res.json({ success: true, message: "Payment failed, order cancelled" });
    } catch (error: any) {
      console.error("Error handling failed payment:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async refundPayment(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const payment = await Payment.findByPk(Number(Array.isArray(id) ? id[0] : id));
      if (!payment) {
        return res.status(404).json({ success: false, message: "Payment not found" });
      }

      await payment.update({ paymentStatus: "REFUNDED" });

      const order = await Order.findByPk(payment.orderId);
      if (order) {
        await order.update({ orderStatus: "REFUNDED" });
      }

      res.json({ success: true, message: "Payment refunded" });
    } catch (error: any) {
      console.error("Error refunding payment:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getPaymentLogs(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const logs = await PaymentLog.findAll({
        where: { paymentId },
        order: [["createdAt", "DESC"]],
      });

      res.json({ success: true, data: logs });
    } catch (error: any) {
      console.error("Error getting payment logs:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getDashboardStats(req: Request, res: Response) {
    try {
      const [totalPayments, successfulPayments, failedPayments, totalRevenue] = await Promise.all([
        Payment.count(),
        Payment.count({ where: { paymentStatus: "SUCCESS" } }),
        Payment.count({ where: { paymentStatus: "FAILED" } }),
        Payment.sum("amount", { where: { paymentStatus: "SUCCESS" } }),
      ]);

      res.json({
        success: true,
        data: {
          totalPayments,
          successfulPayments,
          failedPayments,
          successRate: totalPayments ? (successfulPayments / totalPayments) * 100 : 0,
          totalRevenue: totalRevenue || 0,
        },
      });
    } catch (error: any) {
      console.error("Error getting dashboard stats:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new PaymentController();
