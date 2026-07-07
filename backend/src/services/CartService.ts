
import db from "../models";
import { Transaction } from "sequelize";

const { Cart, CartItem, Product } = db;

export class CartService {
  async getOrCreateCart(userId: number) {
    let cart = await Cart.findOne({
      where: { userId, status: "ACTIVE" },
      include: [{ model: CartItem, as: "items", include: [{ model: Product, as: "product" }] }],
    });

    if (!cart) {
      cart = await Cart.create({ userId, status: "ACTIVE", totalAmount: 0 });
    }

    return cart;
  }

  async addItem(userId: number, productId: number, quantity: number = 1) {
    const cart = await this.getOrCreateCart(userId);
    const product = await Product.findByPk(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.stockQuantity < quantity) {
      throw new Error("Insufficient stock");
    }

    const existingItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    let item;
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice;
      await existingItem.save();
      item = existingItem;
    } else {
      const unitPrice = product.discountPrice || product.price;
      item = await CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
      });
    }

    await this.updateCartTotal(cart.id);
    return item;
  }

  async updateItem(userId: number, itemId: number, quantity: number) {
    const cart = await this.getOrCreateCart(userId);
    const item = await CartItem.findOne({ where: { id: itemId, cartId: cart.id } });

    if (!item) {
      throw new Error("Cart item not found");
    }

    item.quantity = quantity;
    item.totalPrice = item.quantity * item.unitPrice;
    await item.save();

    await this.updateCartTotal(cart.id);
    return item;
  }

  async removeItem(userId: number, itemId: number) {
    const cart = await this.getOrCreateCart(userId);
    const item = await CartItem.findOne({ where: { id: itemId, cartId: cart.id } });

    if (!item) {
      throw new Error("Cart item not found");
    }

    await item.destroy();
    await this.updateCartTotal(cart.id);
    return true;
  }

  private async updateCartTotal(cartId: number) {
    const cartItems = await CartItem.findAll({ where: { cartId } });
    const totalAmount = cartItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);
    await Cart.update({ totalAmount }, { where: { id: cartId } });
  }
}

export default CartService;
