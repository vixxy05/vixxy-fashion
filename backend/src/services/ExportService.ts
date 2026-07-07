
import db from "../models";

const { Conversation, Message, User } = db;

export class ExportService {
  async exportToJSON(conversationId: number) {
    const conversation = await this.getFullConversation(conversationId);
    if (!conversation) throw new Error("Conversation not found");
    return JSON.stringify(conversation, null, 2);
  }

  async exportToCSV(conversationId: number) {
    const conversation = await this.getFullConversation(conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const headers = ["ID", "Sender Type", "Sender", "Content", "Type", "Created At"];
    const rows = (conversation as any).messages?.map((msg: any) => [
      msg.id,
      msg.senderType,
      msg.senderId || "N/A",
      `"${msg.messageContent.replace(/"/g, '""')}"`,
      msg.messageType,
      msg.createdAt.toISOString(),
    ]) || [];

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    return csvContent;
  }

  async exportToPlainText(conversationId: number) {
    const conversation = await this.getFullConversation(conversationId);
    if (!conversation) throw new Error("Conversation not found");

    let text = `=== Conversation: ${conversation.title} ===\n`;
    text += `Started: ${conversation.startedAt.toISOString()}\n`;
    text += `Type: ${conversation.conversationType}\n`;
    text += `Status: ${conversation.status}\n`;
    if (conversation.summary) {
      text += `Summary: ${conversation.summary}\n`;
    }
    text += `\n--- Messages ---\n`;

    (conversation as any).messages?.forEach((msg: any) => {
      text += `[${msg.createdAt.toLocaleString()}] ${msg.senderType}: ${msg.messageContent}\n`;
    });

    return text;
  }

  private async getFullConversation(conversationId: number) {
    return Conversation.findByPk(conversationId, {
      include: [
        { model: User, as: "user", attributes: ["id", "fullName", "email"] },
        { model: Message, as: "messages", where: { isDeleted: false }, order: [["createdAt", "ASC"]] },
      ],
    });
  }
}

export default ExportService;
