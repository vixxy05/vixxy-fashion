
import { Request, Response } from "express";
import CartService from "../services/CartService";

const cartService = new CartService();

export class CartController {
  static async getCart(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const cart = await cartService.getOrCreateCart(userId);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: "Failed to get cart" });
    }
  }

  static async addItem(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { productId, quantity = 1 } = req.body;
      const item = await cartService.addItem(userId, productId, quantity);
      res.json({ success: true, item });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async updateItem(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { id } = req.params;
      const { quantity } = req.body;
      const item = await cartService.updateItem(userId, Number(Array.isArray(id) ? id[0] : id), quantity);
      res.json({ success: true, item });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async removeItem(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { id } = req.params;
      await cartService.removeItem(userId, Number(Array.isArray(id) ? id[0] : id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}

export default CartController;
