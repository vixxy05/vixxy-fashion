
import db from "../models";

const { Message } = db;

export class MessageService {
  async createMessage(data: {
    conversationId: number;
    senderType: "USER" | "AI" | "STAFF" | "SYSTEM";
    senderId?: number;
    messageContent: string;
    messageType?: "TEXT" | "IMAGE" | "FILE" | "PRODUCT_CARD" | "ORDER_CARD" | "SYSTEM_MESSAGE";
    tokenUsed?: number;
    responseTime?: number;
  }) {
    return Message.create({
      ...data,
      messageType: data.messageType || "TEXT"
    });
  }

  async getMessages(conversationId: number) {
    return Message.findAll({
      where: { conversationId },
      order: [["createdAt", "ASC"]]
    });
  }
}

export default MessageService;
