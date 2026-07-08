import express from "express";
import db from "../models";
import { emitToAll, emitToAdmins } from "../socket/socketServer";

const router = express.Router();

// Create a new order
router.post("/", async (req, res) => {
  const { userId, items, shippingName, shippingPhone, shippingAddress, shippingCity, totalAmount, voucherId, discountAmount } = req.body;

  try {
    const order = await db.sequelize.transaction(async (t) => {
      // Create order
      const orderCode = `ORD-${Date.now()}`;
      const createdOrder = await db.Order.create(
        {
          userId,
          orderCode,
          totalAmount,
          shippingName,
          shippingPhone,
          shippingAddress,
          shippingCity,
          orderStatus: "pending",
        },
        { transaction: t }
      );

      // Create payment
      await db.Payment.create(
        {
          orderId: createdOrder.id,
          userId,
          paymentMethod: "MOCK_QR",
          amount: totalAmount,
          currency: "VND",
          paymentStatus: "PENDING",
        },
        { transaction: t }
      );

      // Create order details and inventory reservations
      for (const item of items) {
        await db.OrderDetail.create(
          {
            orderId: createdOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            size: item.size,
          },
          { transaction: t }
        );
        
        // Create inventory reservation instead of immediately deducting stock
        await db.InventoryReservation.create({
          orderId: createdOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          status: "RESERVED",
          expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
        }, { transaction: t });
      }
      
      // Record voucher usage if applicable
      if (voucherId && discountAmount) {
        await db.OrderVoucher.create({
          orderId: createdOrder.id,
          voucherId,
          discountApplied: discountAmount
        }, { transaction: t });

        // Increment voucher used count
        const voucher = await db.Voucher.findByPk(voucherId, { transaction: t });
        if (voucher) {
          await voucher.update({ usedCount: voucher.usedCount + 1 }, { transaction: t });
        }
      }

      return createdOrder;
    });

    // Return the created order
    const populatedOrder = await db.Order.findByPk(order.id, {
      include: [
        { model: db.OrderDetail, as: "orderDetails", include: [{ model: db.Product, as: "product" }] },
        { model: db.Payment, as: "payments" }
      ],
    });

    // Emit events
    emitToAdmins("order:created", populatedOrder);
    emitToAdmins("dashboard:update");

    res.json({ success: true, data: populatedOrder });
  } catch (error: any) {
    console.error("Create order error:", error.message, error.stack);
    res.status(500).json({ success: false, message: "Failed to create order", error: error.message });
  }
});

// Get all orders for a user
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await db.Order.findAll({
      where: { userId },
      include: [
        { model: db.OrderDetail, as: "orderDetails", include: [{ model: db.Product, as: "product" }] },
        { model: db.Payment, as: "payments" },
        { model: db.Shipping, as: "shippings" },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ success: false, message: "Failed to get orders" });
  }
});

// Get an order by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const order = await db.Order.findByPk(id, {
      include: [
        { model: db.OrderDetail, as: "orderDetails", include: [{ model: db.Product, as: "product" }] },
        { model: db.Payment, as: "payments" },
        { model: db.Shipping, as: "shippings" },
      ],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ success: false, message: "Failed to get order" });
  }
});

// Admin: Update order status
router.put("/admin/:id/status", async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await db.Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    await order.update({ orderStatus });
    emitToAll("order:updated", order);
    emitToAdmins("dashboard:update");
    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ success: false, message: "Failed to update order status" });
  }
});

// Cancel order (user or admin)
router.put("/:id/cancel", async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const order = await db.Order.findByPk(req.params.id);
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    await order.update({ orderStatus: "cancelled" }, { transaction });

    // Release inventory reservations
    const reservations = await db.InventoryReservation.findAll({
      where: { orderId: order.id },
      transaction
    });
    for (const reservation of reservations) {
      await reservation.update({ status: "RELEASED" }, { transaction });
    }

    // Restore voucher usage if applicable
    const orderVoucher = await db.OrderVoucher.findOne({
      where: { orderId: order.id },
      transaction
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

    await transaction.commit();
    emitToAll("order:cancelled", order);
    emitToAdmins("dashboard:update");
    res.json({ success: true, data: order });
  } catch (error) {
    await transaction.rollback();
    console.error("Cancel order error:", error);
    res.status(500).json({ success: false, message: "Failed to cancel order" });
  }
});

// Get all orders (admin)
router.get("/admin/all", async (req, res) => {
  try {
    const orders = await db.Order.findAll({
      include: [
        { model: db.User, as: "user" },
        { model: db.OrderDetail, as: "orderDetails" }
      ],
      order: [["createdAt", "DESC"]]
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ success: false, message: "Failed to get orders" });
  }
});

export default router;
