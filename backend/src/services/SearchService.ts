
import db from "../models";
import { Op } from "sequelize";

const { Message, Conversation, User } = db;

export class SearchService {
  async searchMessages(
    keyword?: string,
    conversationId?: number,
    userId?: number,
    startDate?: string,
    endDate?: string,
    senderType?: string,
    limit = 50,
    offset = 0
  ) {
    const whereCondition: any = { isDeleted: false };

    if (keyword) {
      whereCondition.messageContent = { [Op.like]: `%${keyword}%` };
    }

    if (conversationId) {
      whereCondition.conversationId = conversationId;
    }

    if (senderType) {
      whereCondition.senderType = senderType;
    }

    if (startDate || endDate) {
      whereCondition.createdAt = {};
      if (startDate) {
        whereCondition.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereCondition.createdAt[Op.lte] = new Date(endDate);
      }
    }

    const includeConditions: any[] = [
      {
        model: Conversation, as: "conversation", attributes: ["id", "title"] }
    ];

    if (userId) {
      includeConditions.push({
        model: User,
        as: "conversation.user",
        where: { id: userId },
        attributes: ["id", "fullName", "email"],
      });
    }

    const { count, rows } = await Message.findAndCountAll({
      where: whereCondition,
      include: includeConditions,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    return {
      total: count,
      messages: rows };
  }

  async searchConversations(
    keyword?: string,
    userId?: number,
    conversationType?: string,
    status?: string,
    limit = 50,
    offset = 0
  ) {
    const whereCondition: any = { status: { [Op.ne]: "DELETED" } };

    if (keyword) {
      whereCondition[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { summary: { [Op.like]: `%${keyword}%` } },
      ];
    }

    if (userId) {
      whereCondition.userId = userId;
    }

    if (conversationType) {
      whereCondition.conversationType = conversationType;
    }

    if (status) {
      whereCondition.status = status;
    }

    const { count, rows } = await Conversation.findAndCountAll({
      where: whereCondition,
      include: [
        { model: User, as: "user", attributes: ["id", "fullName", "email"] },
      ],
      order: [["lastMessageAt", "DESC"],
              ["createdAt", "DESC"]],
      limit,
      offset,
    });

    return { total: count, conversations: rows };
  }
}

export default SearchService;
