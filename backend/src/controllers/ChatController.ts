
import { Request, Response } from "express";
import ChatService from "../services/ChatService";
import ConversationService from "../services/ConversationService";
import SummaryService from "../services/SummaryService";
import SearchService from "../services/SearchService";
import ExportService from "../services/ExportService";
import db from "../models";

const { ChatbotKnowledge, ChatbotPrompt, AIUsageLog, Conversation, Message, User } = db;

export class ChatController {
  private chatService = new ChatService();
  private conversationService = new ConversationService();
  private summaryService = new SummaryService();
  private searchService = new SearchService();
  private exportService = new ExportService();

  async createConversation(req: Request, res: Response) {
    try {
      const { title, conversationType } = req.body;
      const userId = (req as any).user?.id;

      const conversation = await this.conversationService.createConversation(
        userId || 1, title || "Cuộc trò chuyện mới", conversationType
      );

      res.json({
        success: true,
        conversationId: conversation.id,
        conversation
      });
    } catch (error) {
      console.error("Create conversation error:", error);
      res.status(500).json({ success: false, message: "Failed to create conversation" });
    }
  }

  async sendMessage(req: Request, res: Response) {
    try {
      const { conversationId, message } = req.body;
      const userId = (req as any).user?.id;

      const result = await this.chatService.sendMessage(conversationId, message, userId);
      
      // Update last message time
      await this.conversationService.updateLastMessageTime(conversationId);

      res.json(result);
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({ success: false, message: "Failed to send message" });
    }
  }

  async getConversation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const conversation = await this.conversationService.getConversation(Number(Array.isArray(id) ? id[0] : id), userId);
      
      if (!conversation) {
        return res.status(404).json({ success: false, message: "Conversation not found" });
      }

      res.json({ success: true, conversation });
    } catch (error) {
      console.error("Get conversation error:", error);
      res.status(500).json({ success: false, message: "Failed to get conversation" });
    }
  }

  async getMessageHistory(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const messages = await Message.findAndCountAll({
        where: { conversationId: Number(Array.isArray(conversationId) ? conversationId[0] : conversationId), isDeleted: false },
        order: [["createdAt", "ASC"]],
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });

      res.json({ success: true, ...messages });
    } catch (error) {
      console.error("Get message history error:", error);
      res.status(500).json({ success: false, message: "Failed to get messages" });
    }
  }

  async deleteConversation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      await this.conversationService.softDeleteConversation(Number(Array.isArray(id) ? id[0] : id), userId);

      res.json({ success: true, message: "Conversation deleted" });
    } catch (error) {
      console.error("Delete conversation error:", error);
      res.status(500).json({ success: false, message: "Failed to delete conversation" });
    }
  }

  async closeConversation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await this.conversationService.closeConversation(Number(Array.isArray(id) ? id[0] : id));

      // Optionally generate a summary
      try {
        await this.summaryService.generateSummary(Number(Array.isArray(id) ? id[0] : id), "SYSTEM");
      } catch (e) {
        console.error("Summary generation failed, but conversation closed successfully:", e);
      }

      res.json({ success: true, message: "Conversation closed" });
    } catch (error) {
      console.error("Close conversation error:", error);
      res.status(500).json({ success: false, message: "Failed to close conversation" });
    }
  }

  async archiveConversation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = (req as any).user?.id;

      await this.conversationService.archiveConversation(Number(Array.isArray(id) ? id[0] : id), reason, userId);

      res.json({ success: true, message: "Conversation archived" });
    } catch (error) {
      console.error("Archive conversation error:", error);
      res.status(500).json({ success: false, message: "Failed to archive conversation" });
    }
  }

  async getChatHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 1;
      const { status, conversationType, limit, offset } = req.query;

      const conversations = await this.conversationService.getUserConversations(userId, {
        status: status as string,
        conversationType: conversationType as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      });

      res.json({ success: true, conversations });
    } catch (error) {
      console.error("Get chat history error:", error);
      res.status(500).json({ success: false, message: "Failed to get chat history" });
    }
  }

  async generateSummary(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { generatedBy, generatedById } = req.body;

      const summary = await this.summaryService.generateSummary(
        Number(Array.isArray(id) ? id[0] : id),
        (generatedBy as any) || "AI",
        generatedById
      );

      res.json({ success: true, summary });
    } catch (error) {
      console.error("Generate summary error:", error);
      res.status(500).json({ success: false, message: "Failed to generate summary" });
    }
  }

  async getConversationSummaries(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const summaries = await this.summaryService.getAllSummaries(Number(Array.isArray(id) ? id[0] : id));

      res.json({ success: true, summaries });
    } catch (error) {
      console.error("Get summaries error:", error);
      res.status(500).json({ success: false, message: "Failed to get summaries" });
    }
  }

  async searchMessages(req: Request, res: Response) {
    try {
      const { keyword, conversationId, startDate, endDate, senderType, limit, offset } = req.body;
      const userId = (req as any).user?.id;

      const result = await this.searchService.searchMessages(
        keyword,
        conversationId ? parseInt(conversationId) : undefined,
        userId,
        startDate,
        endDate,
        senderType,
        limit ? parseInt(limit) : 50,
        offset ? parseInt(offset) : 0
      );

      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Search messages error:", error);
      res.status(500).json({ success: false, message: "Failed to search messages" });
    }
  }

  async searchConversations(req: Request, res: Response) {
    try {
      const { keyword, conversationType, status, limit, offset } = req.body;
      const userId = (req as any).user?.id;

      const result = await this.searchService.searchConversations(
        keyword,
        userId,
        conversationType,
        status,
        limit ? parseInt(limit) : 50,
        offset ? parseInt(offset) : 0
      );

      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Search conversations error:", error);
      res.status(500).json({ success: false, message: "Failed to search conversations" });
    }
  }

  async exportConversation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { format = "json" } = req.query;

      let content: string;
      let contentType: string;
      let filename: string;

      switch (format) {
        case "csv":
          content = await this.exportService.exportToCSV(Number(Array.isArray(id) ? id[0] : id));
          contentType = "text/csv";
          filename = `conversation-${id}.csv`;
          break;
        case "txt":
          content = await this.exportService.exportToPlainText(Number(Array.isArray(id) ? id[0] : id));
          contentType = "text/plain";
          filename = `conversation-${id}.txt`;
          break;
        case "json":
        default:
          content = await this.exportService.exportToJSON(Number(Array.isArray(id) ? id[0] : id));
          contentType = "application/json";
          filename = `conversation-${id}.json`;
          break;
      }

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(content);
    } catch (error) {
      console.error("Export conversation error:", error);
      res.status(500).json({ success: false, message: "Failed to export conversation" });
    }
  }

  async addTagToConversation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { tagName } = req.body;

      const tag = await this.conversationService.addTag(Number(Array.isArray(id) ? id[0] : id), tagName);

      res.json({ success: true, tag });
    } catch (error) {
      console.error("Add tag error:", error);
      res.status(500).json({ success: false, message: "Failed to add tag" });
    }
  }

  async removeTagFromConversation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { tagName } = req.body;

      await this.conversationService.removeTag(Number(Array.isArray(id) ? id[0] : id), tagName);

      res.json({ success: true, message: "Tag removed" });
    } catch (error) {
      console.error("Remove tag error:", error);
      res.status(500).json({ success: false, message: "Failed to remove tag" });
    }
  }

  async getAllTags(req: Request, res: Response) {
    try {
      const tags = await this.conversationService.getAllTags();
      res.json({ success: true, tags });
    } catch (error) {
      console.error("Get all tags error:", error);
      res.status(500).json({ success: false, message: "Failed to get tags" });
    }
  }

  async getDashboardStats(req: Request, res: Response) {
    try {
      const [
        totalConversations,
        totalMessages,
        totalAIUsageLogs
      ] = await Promise.all([
        Conversation.count(),
        Message.count(),
        AIUsageLog.count()
      ]);

      // Calculate avg response time
      const avgResponseTimeResult = await AIUsageLog.findOne({
        attributes: [
          [db.sequelize.fn("AVG", db.sequelize.col("responseTime")), "avgResponseTime"]
        ]
      });

      const avgResponseTime = avgResponseTimeResult?.getDataValue("avgResponseTime") || 0;

      res.json({
        success: true,
        data: {
          totalConversations,
          totalMessages,
          avgResponseTime: Math.round(avgResponseTime),
          totalAIUsageLogs
        }
      });
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ success: false, message: "Failed to get dashboard stats" });
    }
  }

  async getFAQs(req: Request, res: Response) {
    try {
      const faqs = await ChatbotKnowledge.findAll();
      res.json({ success: true, faqs });
    } catch (error) {
      console.error("Get FAQs error:", error);
      res.status(500).json({ success: false, message: "Failed to get FAQs" });
    }
  }

  async addFAQ(req: Request, res: Response) {
    try {
      const { category, question, answer } = req.body;
      const faq = await ChatbotKnowledge.create({ category, question, answer });
      res.json({ success: true, faq });
    } catch (error) {
      console.error("Add FAQ error:", error);
      res.status(500).json({ success: false, message: "Failed to add FAQ" });
    }
  }
}

export default new ChatController();
