
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Conversation from "./Conversation";
import MessageAttachment from "./MessageAttachment";

class Message extends Model {
  public id!: number;
  public conversationId!: number;
  public senderType!: "USER" | "AI" | "STAFF" | "ADMIN" | "SYSTEM";
  public senderId?: number;
  public messageContent!: string;
  public messageType!: "TEXT" | "IMAGE" | "FILE" | "VOICE" | "VIDEO" | "PRODUCT_CARD" | "ORDER_CARD" | "SYSTEM_MESSAGE";
  public isEdited!: boolean;
  public isDeleted!: boolean;
  public tokenUsed?: number;
  public responseTime?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate() {
    this.belongsTo(Conversation, { foreignKey: "conversationId", as: "conversation" });
    this.hasMany(MessageAttachment, { foreignKey: "messageId", as: "attachments" });
  }
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "conversations", key: "id" },
    },
    senderType: {
      type: DataTypes.ENUM("USER", "AI", "STAFF", "ADMIN", "SYSTEM"),
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    messageContent: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    messageType: {
      type: DataTypes.ENUM("TEXT", "IMAGE", "FILE", "VOICE", "VIDEO", "PRODUCT_CARD", "ORDER_CARD", "SYSTEM_MESSAGE"),
      allowNull: false,
      defaultValue: "TEXT",
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    tokenUsed: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    responseTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Message",
    tableName: "messages",
    timestamps: true,
  }
);

export default Message;
