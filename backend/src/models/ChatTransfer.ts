
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import ChatSession from "./ChatSession";
import User from "./User";

class ChatTransfer extends Model {
  public id!: number;
  public sessionId!: number;
  public fromAdminId!: number;
  public toAdminId!: number;
  public reason?: string;
  public readonly createdAt!: Date;

  public static associate() {
    this.belongsTo(ChatSession, { foreignKey: "sessionId" });
    this.belongsTo(User, { foreignKey: "fromAdminId", as: "fromAdmin" });
    this.belongsTo(User, { foreignKey: "toAdminId", as: "toAdmin" });
  }
}

ChatTransfer.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "chat_sessions", key: "id" } },
    fromAdminId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" } },
    toAdminId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" } },
    reason: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, modelName: "ChatTransfer", tableName: "chat_transfers", timestamps: true, updatedAt: false }
);

export default ChatTransfer;
