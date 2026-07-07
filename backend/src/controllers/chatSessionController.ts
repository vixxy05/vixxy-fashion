
import { Request, Response } from "express";
import db from "../models";

export const createSession = async (req: Request, res: Response) => {
  try {
    const { customerId, priority = "MEDIUM" } = req.body;

    const conversation = await db.Conversation.create({
      userId: customerId,
      title: "Live Chat Support",
      conversationType: "AI_CHAT",
      status: "ACTIVE",
      startedAt: new Date(),
    });

    const session = await db.ChatSession.create({
      conversationId: conversation.id,
      customerId,
      priority,
      status: "WAITING",
      startedAt: new Date(),
    });

    const queueCount = await db.ChatQueue.count({ where: { status: "WAITING" } });
    await db.ChatQueue.create({
      customerId,
      queueNumber: queueCount + 1,
      status: "WAITING",
    });

    res.status(201).json({ success: true, session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = await db.ChatSession.findByPk(Number(Array.isArray(id) ? id[0] : id), {
      include: [
        { model: db.User, as: "customer" },
        { model: db.User, as: "assignedAdmin" },
        { model: db.Conversation },
      ],
    });
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }
    res.json({ success: true, session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getSessionList = async (req: Request, res: Response) => {
  try {
    const sessions = await db.ChatSession.findAll({
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

export const transferSession = async (req: Request, res: Response) => {
  try {
    const { sessionId, fromStaffId, toStaffId, reason } = req.body;

    const session = await db.ChatSession.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    await db.ChatTransfer.create({
      sessionId,
      fromAdminId: fromStaffId,
      toAdminId: toStaffId,
      reason,
    });

    await session.update({
      assignedAdminId: toStaffId,
      status: "TRANSFERRED",
    });

    res.json({ success: true, session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const closeSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    const session = await db.ChatSession.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }
    await session.update({
      status: "CLOSED",
      endedAt: new Date(),
    });
    res.json({ success: true, session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
