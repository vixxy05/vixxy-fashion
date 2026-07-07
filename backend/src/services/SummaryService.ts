
import db from "../models";

const { Conversation, Message, ConversationSummary } = db;

export class SummaryService {
  async generateSummary(conversationId: number, generatedBy: "AI" | "SYSTEM" | "STAFF" = "AI", generatedById?: number) {
    const conversation = await Conversation.findByPk(conversationId, {
      include: [{ model: Message, as: "messages", where: { isDeleted: false }, order: [["createdAt", "ASC"]] }],
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Generate a simple summary based on the conversation messages
    const messages = (conversation as any).messages || [];
    const userMessages = messages.filter((m: any) => m.senderType === "USER").map((m: any) => m.messageContent);
    const summaryContent = this.createSimpleSummary(userMessages, conversation.title);

    // Create summary entry
    const summary = await ConversationSummary.create({
      conversationId,
      summaryContent,
      generatedBy,
      generatedById,
    });

    // Update conversation summary field
    await conversation.update({ summary: summaryContent });

    return summary;
  }

  private createSimpleSummary(userMessages: string[], title: string): string {
    if (userMessages.length === 0) {
      return `Cuộc trò chuyện "${title}" chưa có tin nhắn nào từ người dùng.`;
    }

    // Take first 3 user messages for summary
    const sampleMessages = userMessages.slice(0, 3);
    const preview = sampleMessages.join(". ");
    
    return `Cuộc trò chuyện "${title}" có ${userMessages.length} tin nhắn từ người dùng. Nội dung chính: ${preview}`;
  }

  async getLatestSummary(conversationId: number) {
    return ConversationSummary.findOne({
      where: { conversationId },
      order: [["createdAt", "DESC"]],
    });
  }

  async getAllSummaries(conversationId: number) {
    return ConversationSummary.findAll({
      where: { conversationId },
      order: [["createdAt", "DESC"]],
      include: [{ model: db.User, as: "generatedByUser", attributes: ["id", "fullName", "email"] }],
    });
  }
}

export default SummaryService;
