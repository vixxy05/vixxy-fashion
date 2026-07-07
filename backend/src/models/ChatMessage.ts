
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import ChatSession from "./ChatSession";
import User from "./User";

class ChatMessage extends Model {
  public id!: number;
  public sessionId!: number;
  public senderType!: "CUSTOMER" | "STAFF" | "ADMIN" | "SYSTEM";
  public senderId!: number;
  public messageContent!: string;
  public messageType!: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
  public isRead!: boolean;
  public readonly createdAt!: Date;

  public static associate() {
    this.belongsTo(ChatSession, { foreignKey: "sessionId" });
    this.belongsTo(User, { foreignKey: "senderId", as: "sender" });
  }
}

ChatMessage.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "chat_sessions", key: "id" } },
    senderType: { type: DataTypes.ENUM("CUSTOMER", "STAFF", "ADMIN", "SYSTEM"), allowNull: false },
    senderId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" } },
    messageContent: { type: DataTypes.TEXT, allowNull: false },
    messageType: { type: DataTypes.ENUM("TEXT", "IMAGE", "FILE", "SYSTEM"), allowNull: false, defaultValue: "TEXT" },
    isRead: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  { sequelize, modelName: "ChatMessage", tableName: "chat_messages", timestamps: true, updatedAt: false }
);

export default ChatMessage;
