
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import ChatMessage from "./ChatMessage";

class ChatAttachment extends Model {
  public id!: number;
  public messageId!: number;
  public fileName!: string;
  public fileUrl!: string;
  public fileType!: string;
  public readonly createdAt!: Date;

  public static associate() {
    this.belongsTo(ChatMessage, { foreignKey: "messageId" });
  }
}

ChatAttachment.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    messageId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "chat_messages", key: "id" } },
    fileName: { type: DataTypes.STRING, allowNull: false },
    fileUrl: { type: DataTypes.STRING, allowNull: false },
    fileType: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize, modelName: "ChatAttachment", tableName: "chat_attachments", timestamps: true, updatedAt: false }
);

export default ChatAttachment;
