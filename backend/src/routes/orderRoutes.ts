import express from "express";
import db from "../models";

const router = express.Router();

// Create a new order
router.post("/", async (req, res) => {
  const { userId, items, shippingName, shippingPhone, shippingAddress, shippingCity, totalAmount } = req.body;

  try {
    const order = await db.sequelize.transaction(async (t) => {
      // Create order
      const createdOrder = await db.Order.create(
        {
          userId,
          totalAmount,
          shippingName,
          shippingPhone,
          shippingAddress,
          shippingCity,
          orderStatus: "pending",
        },
        { transaction: t }
      );

      // Create order details
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
      }

      return createdOrder;
    });

    // Return the created order
    const populatedOrder = await db.Order.findByPk(order.id, {
      include: [
        { model: db.OrderDetail, as: "orderDetails", include: [{ model: db.Product, as: "product" }] },
      ],
    });

    res.json({ success: true, data: populatedOrder });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ success: false, message: "Failed to create order" });
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

export default router;
