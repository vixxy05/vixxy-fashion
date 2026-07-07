
import db from "../models";
import CartService from "./CartService";
import PaymentService from "./PaymentService";
import ShippingService from "./ShippingService";

const { Order, OrderDetail, Product, Cart, CartItem } = db;
const cartService = new CartService();
const paymentService = new PaymentService();
const shippingService = new ShippingService();

export class OrderService {
  async createOrder(userId: number, paymentMethod: string, shippingDetails: any, items?: any[]) {
    console.log("createOrder called with items:", items);
    let orderItems: any[] = [];
    
    let cartTotalAmount = 0;

    if (items && items.length > 0) {
      orderItems = items;
    } else {
      const cart = await cartService.getOrCreateCart(userId);
      if (!(cart as any).items || (cart as any).items.length === 0) {
        throw new Error("Cart is empty");
      }
      orderItems = (cart as any).items;
      cartTotalAmount = Number((cart as any)?.totalAmount) || 0;
    }

    // Calculate total amount
    const totalAmount = orderItems.reduce((sum, item) => {
      const price = item.totalPrice 
        || (item.unitPrice * item.quantity) 
        || (item.product?.price * item.quantity) 
        || 0;
      return sum + Number(price);
    }, 0);
    
    const orderCode = `ORD${Date.now()}`;
    console.log("Creating order with totalAmount:", totalAmount);
    
    const order = await Order.create({
      userId,
      orderCode,
      totalAmount,
      orderStatus: "pending",
      shippingAddress: shippingDetails.address,
      shippingCity: shippingDetails.city,
      shippingPhone: shippingDetails.phone,
      shippingName: shippingDetails.name,
    });

    console.log("Order created, now adding order details...");
    for (const item of orderItems) {
      console.log("Processing item:", item);
      let productId = item.productId || item.product?.id;
      let unitPrice = item.unitPrice || item.product?.price;
      let quantity = item.quantity || 1;
      let totalPrice = item.totalPrice || (unitPrice * quantity);

      // If productId is not available but product exists, get it from the database using slug
      if (!productId && item.product?.slug) {
        const product = await Product.findOne({ where: { slug: item.product.slug } });
        if (product) {
          productId = product.id;
          if (!unitPrice) unitPrice = product.discountPrice || product.price;
          totalPrice = unitPrice * quantity;
        }
      }

      if (!productId) {
        console.error("Could not find productId for item:", item);
        continue;
      }

      await OrderDetail.create({
        orderId: order.id,
        productId,
        quantity,
        unitPrice,
        totalPrice,
      } as any);
    }

    const payment = await paymentService.createPayment(
      order.id,
      userId,
      cartTotalAmount,
      paymentMethod
    );

    return { order, payment };
  }

  async updateOrderStatus(orderId: number, status: string) {
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error("Order not found");
    await order.update({ orderStatus: status });
    return order;
  }

  async getOrderById(orderId: number) {
    return await Order.findByPk(orderId, {
      include: [{ model: OrderDetail, as: "orderDetails", include: [{ model: Product, as: "product" }] }],
    });
  }

  async getOrdersByUserId(userId: number) {
    return await Order.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
  }
}

export default OrderService;
