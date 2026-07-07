
import { Request, Response } from "express";
import AISellingService from "../services/AISellingService";

const aiSellingService = new AISellingService();

export class AISellingController {
  static async sendMessage(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { message, conversationId } = req.body;
      const response = await aiSellingService.processMessage(userId, message, conversationId);
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: "Failed to process message" });
    }
  }

  static async getDashboardStats(req: Request, res: Response) {
    try {
      const stats = await aiSellingService.getSessionStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get stats" });
    }
  }
}

export default AISellingController;
