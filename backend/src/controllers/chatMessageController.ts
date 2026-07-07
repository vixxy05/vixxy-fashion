
import { Request, Response } from "express";
import db from "../models";

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const {
      sessionId,
      senderType,
      senderId,
      messageContent,
      messageType = "TEXT",
    } = req.body;
    const message = await db.ChatMessage.create({
      sessionId,
      senderType,
      senderId,
      messageContent,
      messageType,
      isRead: false,
    });
    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getSessionMessages = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const messages = await db.ChatMessage.findAll({
      where: { sessionId },
      include: [
        { model: db.User, as: "sender" },
        { model: db.ChatAttachment },
      ],
      order: [["createdAt", "ASC"]],
    });
    res.json({ success: true, messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const sessions = await db.ChatSession.findAll({
      where: userId ? { customerId: Number(userId) } : {},
      include: [
        { model: db.User, as: "customer" },
        { model: db.User, as: "assignedAdmin" },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, sessions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
