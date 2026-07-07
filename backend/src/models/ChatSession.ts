
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Conversation from "./Conversation";
import User from "./User";

class ChatSession extends Model {
  public id!: number;
  public conversationId!: number;
  public customerId!: number;
  public assignedAdminId?: number;
  public departmentId?: number;
  public priority!: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  public status!: "WAITING" | "ASSIGNED" | "ACTIVE" | "CLOSED" | "TRANSFERRED";
  public startedAt!: Date;
  public endedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate() {
    this.belongsTo(Conversation, { foreignKey: "conversationId" });
    this.belongsTo(User, { foreignKey: "customerId", as: "customer" });
    this.belongsTo(User, { foreignKey: "assignedAdminId", as: "assignedAdmin" });
  }
}

ChatSession.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    conversationId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "conversations", key: "id" } },
    customerId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" } },
    assignedAdminId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "users", key: "id" } },
    departmentId: { type: DataTypes.INTEGER, allowNull: true },
    priority: { type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH", "URGENT"), allowNull: false, defaultValue: "MEDIUM" },
    status: { type: DataTypes.ENUM("WAITING", "ASSIGNED", "ACTIVE", "CLOSED", "TRANSFERRED"), allowNull: false, defaultValue: "WAITING" },
    startedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    endedAt: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, modelName: "ChatSession", tableName: "chat_sessions", timestamps: true }
);

export default ChatSession;
