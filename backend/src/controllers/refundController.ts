
import { Request, Response } from "express";
import db from "../models";
import { emitToAll, emitToAdmins } from "../socket/socketServer";

export const requestRefund = async (req: Request, res: Response) => {
  try {
    const { orderId, userId, reason } = req.body;
    const refundRequest = await db.RefundRequest.create({
      orderId,
      userId,
      reason,
      status: "PENDING",
    });
    emitToAdmins("refund:new", refundRequest);
    res.json({ success: true, data: refundRequest });
  } catch (error) {
    console.error("Request refund error:", error);
    res.status(500).json({ success: false, message: "Failed to request refund" });
  }
};

export const getUserRefunds = async (req: Request, res: Response) => {
  try {
    const refunds = await db.RefundRequest.findAll({
      where: { userId: req.params.userId },
      include: [{ model: db.Order, as: "order" }],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, data: refunds });
  } catch (error) {
    console.error("Get user refunds error:", error);
    res.status(500).json({ success: false, message: "Failed to get refunds" });
  }
};

export const getAllRefunds = async (req: Request, res: Response) => {
  try {
    const refunds = await db.RefundRequest.findAll({
      include: [
        { model: db.Order, as: "order" },
        { model: db.User, as: "user" },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, data: refunds });
  } catch (error) {
    console.error("Get all refunds error:", error);
    res.status(500).json({ success: false, message: "Failed to get refunds" });
  }
};

export const processRefund = async (req: Request, res: Response) => {
  const transaction = await db.sequelize.transaction();
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const refundId = Number(idParam);
    const { status, adminReason, adminId } = req.body;
    const refundRequest = await db.RefundRequest.findByPk(refundId);
    if (!refundRequest) {
      return res.status(404).json({ success: false, message: "Refund request not found" });
    }

    await refundRequest.update(
      {
        status,
        adminId,
        adminReason,
        processedAt: new Date(),
      },
      { transaction }
    );

    if (status === "APPROVED") {
      const order = await db.Order.findByPk(refundRequest.orderId);
      if (order) {
        await order.update({ orderStatus: "refunded" }, { transaction });
        
        // Restore inventory
        const orderDetails = await db.OrderDetail.findAll({
          where: { orderId: order.id },
          transaction,
        });
        for (const detail of orderDetails) {
          const product = await db.Product.findByPk(detail.productId, { transaction });
          if (product) {
            await product.update(
              { stockQuantity: product.stockQuantity + detail.quantity },
              { transaction }
            );
          }
        }

        // Restore voucher usage if applicable
        const orderVoucher = await db.OrderVoucher.findOne({
          where: { orderId: order.id },
          transaction,
        });
        if (orderVoucher) {
          const voucher = await db.Voucher.findByPk(orderVoucher.voucherId, { transaction });
          if (voucher) {
            await voucher.update(
              { usedCount: Math.max(0, voucher.usedCount - 1) },
              { transaction }
            );
          }
        }
      }
    }

    await transaction.commit();
    emitToAll("refund:processed", refundRequest);
    res.json({ success: true, data: refundRequest });
  } catch (error) {
    await transaction.rollback();
    console.error("Process refund error:", error);
    res.status(500).json({ success: false, message: "Failed to process refund" });
  }
};
