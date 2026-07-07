
import prisma from '../lib/prisma';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';

export class PrismaOrderService {
  async createOrder(
    userId: number,
    paymentMethod: string,
    shippingAddress: string,
    totalAmount: number
  ) {
    const orderCode = `ORD-${Date.now()}`;
    const order = await prisma.order.create({
      data: {
        userId,
        orderCode,
        totalAmount,
        orderStatus: 'PENDING',
        shippingAddress,
        paymentMethod,
      },
    });

    const transactionId = uuidv4();
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        paymentMethod,
        amount: totalAmount,
        transactionId,
        paymentStatus: 'PENDING',
      },
    });

    return { order, payment };
  }

  async getOrderById(orderId: number) {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });
  }

  async updateOrderStatus(orderId: number, status: string) {
    return prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: status },
    });
  }
}

export class PrismaPaymentService {
  async createQrPayment(orderId: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new Error('Order not found');

    // Kiểm tra xem đã có payment nào chưa
    let payment = await prisma.payment.findFirst({
      where: { orderId },
    });

    if (!payment) {
      const transactionId = uuidv4();
      payment = await prisma.payment.create({
        data: {
          orderId,
          paymentMethod: order.paymentMethod || 'QR_DEMO',
          amount: order.totalAmount,
          transactionId,
          paymentStatus: 'PENDING',
        },
      });
    }

    // Tạo log CREATE_QR
    await prisma.paymentLog.create({
      data: {
        paymentId: payment.id,
        logType: 'CREATE_QR',
        requestData: JSON.stringify({ orderId }),
      },
    });

    const paymentUrl = `${env.frontendUrl}/payment/mock?orderId=${orderId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(paymentUrl);

    return { paymentUrl, qrCode: qrCodeDataUrl };
  }

  async getPaymentStatus(orderId: number) {
    const payment = await prisma.payment.findFirst({
      where: { orderId },
    });
    return payment ? payment.paymentStatus : null;
  }

  async mockPaymentSuccess(orderId: number) {
    const payment = await prisma.payment.findFirst({
      where: { orderId },
    });
    if (!payment) throw new Error('Payment not found');
    if (payment.paymentStatus === 'PAID') throw new Error('Order already paid');

    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymentStatus: 'PAID',
        paidAt: new Date(),
      },
    });

    // Cập nhật Order sang PROCESSING
    await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: 'PROCESSING' },
    });

    // Tạo log PAYMENT_SUCCESS
    await prisma.paymentLog.create({
      data: {
        paymentId: payment.id,
        logType: 'PAYMENT_SUCCESS',
        requestData: JSON.stringify({ orderId }),
      },
    });

    return updatedPayment;
  }

  async getAllPayments() {
    return prisma.payment.findMany({
      include: { order: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default {
  order: new PrismaOrderService(),
  payment: new PrismaPaymentService(),
};

