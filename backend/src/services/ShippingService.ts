
import db from "../models";

const { Shipping } = db;

export class ShippingService {
  async createShipping(orderId: number) {
    const shippingCode = `SHIP${Date.now()}`;
    return await Shipping.create({
      orderId,
      shippingStatus: "pending",
    } as any);
  }

  async getShippingByOrderId(orderId: number) {
    return await Shipping.findOne({ where: { orderId } });
  }

  async updateShippingStatus(orderId: number, status: string) {
    return await Shipping.update(
      { shippingStatus: status },
      { where: { orderId } }
    );
  }
}

export default ShippingService;
