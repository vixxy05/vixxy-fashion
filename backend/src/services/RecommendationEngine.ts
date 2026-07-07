
import db from "../models";
import { Op } from "sequelize";

const { Product, Order, OrderDetail, AIRecommendationLog } = db;

export class RecommendationEngine {
  async searchProducts(keyword: string, limit = 10) {
    return await Product.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { name: { $like: `%${keyword}%` } },
          { description: { $like: `%${keyword}%` } },
          { shortDescription: { $like: `%${keyword}%` } },
        ],
      },
      limit,
      order: [["isFeatured", "DESC"], ["createdAt", "DESC"]],
    });
  }

  async recommendProducts(userId?: number, limit = 10) {
    let products = [];

    if (userId) {
      const orderDetails = await OrderDetail.findAll({
        include: [
          {
            model: Order,
            as: "order",
            where: { userId },
          },
        ],
        limit: 5,
      });
      const purchasedProductIds = orderDetails.map((od) => od.productId);

      if (purchasedProductIds.length > 0) {
        products = await Product.findAll({
          where: {
            isActive: true,
            id: { [Op.notIn]: purchasedProductIds },
          },
          limit,
          order: [["isFeatured", "DESC"]],
        });
      }
    }

    if (products.length === 0) {
      products = await Product.findAll({
        where: { isActive: true },
        limit,
        order: [["isFeatured", "DESC"], ["stockQuantity", "DESC"]],
      });
    }

    return products;
  }

  async getUpsellProducts(productId: number, limit = 5) {
    return await Product.findAll({
      where: { isActive: true, id: { $not: productId } },
      limit,
      order: [["price", "DESC"]],
    });
  }

  async getCrossSellProducts(productId: number, limit = 5) {
    return await Product.findAll({
      where: { isActive: true, id: { $not: productId } },
      limit,
      order: [["price", "ASC"]],
    });
  }

  async logRecommendation(
    userId: number,
    productId: number,
    recommendationType: "PRODUCT" | "UPSELL" | "CROSS_SELL" | "SIZE" | "COLLECTION",
    score?: number
  ) {
    return await AIRecommendationLog.create({
      userId,
      productId,
      recommendationType,
      score,
    });
  }
}

export default RecommendationEngine;
