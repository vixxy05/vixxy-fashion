
import { Server, Socket } from "socket.io";
import { createServer } from "http";
import app from "../app";
import db from "../models";
import { env } from "../config/env";

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: env.corsOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

interface OnlineUser {
  userId: number;
  socketId: string;
  role: string;
}

const onlineUsers = new Map<string, OnlineUser>();

io.on("connection", (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("customer-connect", async (data: { userId: number }) => {
    onlineUsers.set(socket.id, {
      userId: data.userId,
      socketId: socket.id,
      role: "CUSTOMER",
    });
    console.log(`Customer ${data.userId} connected: ${socket.id}`);
  });

  socket.on("staff-connect", async (data: { userId: number }) => {
    onlineUsers.set(socket.id, {
      userId: data.userId,
      socketId: socket.id,
      role: "STAFF",
    });
    console.log(`Staff ${data.userId} connected: ${socket.id}`);
    io.emit("staff-online", { userId: data.userId });
  });

  socket.on("join-session", (sessionId: number) => {
    socket.join(`session-${sessionId}`);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
  });

  socket.on("leave-session", (sessionId: number) => {
    socket.leave(`session-${sessionId}`);
    console.log(`Socket ${socket.id} left session ${sessionId}`);
  });

  socket.on("send-message", async (data: {
    sessionId: number;
    senderType: "CUSTOMER" | "STAFF" | "ADMIN" | "SYSTEM";
    senderId: number;
    messageContent: string;
    messageType: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
  }) => {
    try {
      const message = await db.ChatMessage.create({
        sessionId: data.sessionId,
        senderType: data.senderType,
        senderId: data.senderId,
        messageContent: data.messageContent,
        messageType: data.messageType,
        isRead: false,
      });

      io.to(`session-${data.sessionId}`).emit("receive-message", message);

      if (data.senderType === "CUSTOMER") {
        io.emit("new-customer-message", {
          sessionId: data.sessionId,
          message,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("typing", (data: { sessionId: number; username: string }) => {
    socket.to(`session-${data.sessionId}`).emit("user-typing", {
      username: data.username,
      sessionId: data.sessionId,
    });
  });

  socket.on("stop-typing", (data: { sessionId: number; username: string }) => {
    socket.to(`session-${data.sessionId}`).emit("user-stop-typing", {
      username: data.username,
      sessionId: data.sessionId,
    });
  });

  socket.on("message-read", async (data: { messageId: number; userId: number }) => {
    await db.ChatMessage.update(
      { isRead: true },
      { where: { id: data.messageId } }
    );
    io.emit("message-status-updated", {
      messageId: data.messageId,
      isRead: true,
    });
  });

  socket.on("assign-session", async (data: {
    sessionId: number;
    staffId: number;
  }) => {
    try {
      const session = await db.ChatSession.findByPk(data.sessionId);
      if (!session) throw new Error("Session not found");

      await session.update({
        assignedAdminId: data.staffId,
        status: "ASSIGNED",
      });

      io.emit("session-assigned", {
        sessionId: data.sessionId,
        staffId: data.staffId,
      });
    } catch (error) {
      console.error("Error assigning session:", error);
    }
  });

  socket.on("transfer-session", async (data: {
    sessionId: number;
    fromStaffId: number;
    toStaffId: number;
    reason?: string;
  }) => {
    try {
      const session = await db.ChatSession.findByPk(data.sessionId);
      if (!session) throw new Error("Session not found");

      await db.ChatTransfer.create({
        sessionId: data.sessionId,
        fromAdminId: data.fromStaffId,
        toAdminId: data.toStaffId,
        reason: data.reason,
      });

      await session.update({
        assignedAdminId: data.toStaffId,
        status: "TRANSFERRED",
      });

      io.emit("session-transferred", {
        sessionId: data.sessionId,
        fromStaffId: data.fromStaffId,
        toStaffId: data.toStaffId,
      });
    } catch (error) {
      console.error("Error transferring session:", error);
    }
  });

  socket.on("close-session", async (data: { sessionId: number }) => {
    try {
      const session = await db.ChatSession.findByPk(data.sessionId);
      if (!session) throw new Error("Session not found");

      await session.update({
        status: "CLOSED",
        endedAt: new Date(),
      });

      io.emit("session-closed", {
        sessionId: data.sessionId,
      });
    } catch (error) {
      console.error("Error closing session:", error);
    }
  });

  socket.on("disconnect", () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      onlineUsers.delete(socket.id);
      if (user.role === "STAFF") {
        io.emit("staff-offline", { userId: user.userId });
      }
      console.log(`User ${user.userId} disconnected: ${socket.id}`);
    }
  });
});

export { httpServer, io };
