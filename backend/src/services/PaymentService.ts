
import db from "../models";
import QRCode from "qrcode";
import { env } from "../config/env";

const { Payment, PaymentLog, Order } = db;

export class PaymentService {
  async createPayment(orderId: number, userId: number, amount: number, paymentMethod: string) {
    const transactionId = `TXN${Date.now()}`;
    return await Payment.create({
      orderId,
      userId,
      paymentMethod,
      amount,
      currency: "VND",
      transactionId,
      paymentStatus: "PENDING",
    });
  }

  async getPaymentByOrderId(orderId: number) {
    return await Payment.findOne({ where: { orderId } });
  }

  async getPaymentStatus(orderId: number) {
    const payment = await this.getPaymentByOrderId(orderId);
    return payment ? payment.paymentStatus : null;
  }

  async generateQRCode(orderId: number) {
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error("Order not found");
    
    const qrData = `${env.frontendUrl}/payment/mock?orderId=${orderId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData);
    return qrCodeDataUrl;
  }

  async updatePaymentStatus(orderId: number, status: string, responseData?: any) {
    const payment = await this.getPaymentByOrderId(orderId);
    if (!payment) throw new Error("Payment not found");

    await payment.update({ paymentStatus: status });

    await PaymentLog.create({
      paymentId: payment.id,
      logType: "STATUS_UPDATE",
      requestData: JSON.stringify({ orderId, status }),
      responseData: JSON.stringify(responseData || {}),
    });

    return payment;
  }

  async getAllPayments() {
    return await Payment.findAll({
      include: [{ model: Order, as: "order" }],
      order: [["createdAt", "DESC"]],
    });
  }
}

export default PaymentService;
