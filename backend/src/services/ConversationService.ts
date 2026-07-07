
import db from "../models";

const { Conversation, Message, User, ConversationTag, ConversationArchive } = db;

export class ConversationService {
  async createConversation(userId: number, title: string, conversationType: string = "AI_CHAT") {
    const conversation = await Conversation.create({
      userId,
      title: title || "Cuộc trò chuyện mới",
      conversationType: conversationType as any,
      status: "ACTIVE",
      startedAt: new Date(),
      lastMessageAt: new Date()
    });

    // Add system welcome message
    await Message.create({
      conversationId: conversation.id,
      senderType: "SYSTEM",
      messageContent: "Xin chào! Tôi là trợ lý AI của VIXXY D'ORANCE. Tôi có thể giúp bạn gì hôm nay?",
      messageType: "SYSTEM_MESSAGE"
    });

    return conversation;
  }

  async getConversation(id: number, userId?: number) {
    const whereCondition: any = { id };
    if (userId) whereCondition.userId = userId;

    return Conversation.findOne({
      where: whereCondition,
      include: [
        { model: User, as: "user", attributes: ["id", "email", "fullName"] },
        { model: Message, as: "messages", where: { isDeleted: false }, order: [["createdAt", "ASC"]], required: false },
        { model: ConversationTag, as: "tags", required: false },
      ]
    });
  }

  async getUserConversations(userId: number, options: { status?: string, conversationType?: string, limit?: number, offset?: number } = {}) {
    const whereCondition: any = { userId, status: { [db.sequelize.constructor['Op']?.ne || 'ne']: "DELETED" } };

    if (options.status) {
      whereCondition.status = options.status;
    }

    if (options.conversationType) {
      whereCondition.conversationType = options.conversationType;
    }

    return Conversation.findAll({
      where: whereCondition,
      order: [["lastMessageAt", "DESC"], ["createdAt", "DESC"]],
      limit: options.limit || 50,
      offset: options.offset || 0
    });
  }

  async updateLastMessageTime(conversationId: number) {
    await Conversation.update(
      { lastMessageAt: new Date() },
      { where: { id: conversationId } }
    );
  }

  async softDeleteConversation(id: number, userId?: number) {
    const whereCondition: any = { id };
    if (userId) whereCondition.userId = userId;

    const conversation = await Conversation.findOne({ where: whereCondition });
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    await conversation.update({ status: "DELETED" });
    return true;
  }

  async closeConversation(id: number) {
    const conversation = await Conversation.findByPk(id);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    await conversation.update({
      status: "CLOSED",
      endedAt: new Date()
    });

    return conversation;
  }

  async archiveConversation(id: number, reason?: string, archivedById?: number) {
    const conversation = await Conversation.findByPk(id);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    await conversation.update({
      status: "ARCHIVED"
    });

    await ConversationArchive.create({
      conversationId: id,
      archiveReason: reason,
      archivedById,
      archivedAt: new Date()
    });

    return conversation;
  }

  async addTag(conversationId: number, tagName: string) {
    return ConversationTag.create({
      conversationId,
      tagName: tagName.trim()
    });
  }

  async removeTag(conversationId: number, tagName: string) {
    return ConversationTag.destroy({
      where: {
        conversationId,
        tagName: tagName.trim()
      }
    });
  }

  async getAllTags() {
    const tags = await ConversationTag.findAll({
      attributes: ["tagName", [db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"]],
      group: ["tagName"],
      order: [[db.sequelize.fn("COUNT", db.sequelize.col("id")), "DESC"]]
    });
    return tags;
  }
}

export default ConversationService;
