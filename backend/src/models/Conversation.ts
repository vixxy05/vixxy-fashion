
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import User from "./User";
import Message from "./Message";
import ConversationSummary from "./ConversationSummary";
import ConversationTag from "./ConversationTag";
import ConversationArchive from "./ConversationArchive";

class Conversation extends Model {
  public id!: number;
  public userId!: number;
  public title!: string;
  public conversationType!: "AI_CHAT" | "LIVE_CHAT" | "ORDER_SUPPORT" | "PRODUCT_SUPPORT" | "CUSTOMER_SERVICE" | "GROUP_CHAT";
  public status!: "ACTIVE" | "CLOSED" | "ARCHIVED" | "DELETED";
  public summary?: string;
  public lastMessageAt?: Date;
  public startedAt!: Date;
  public endedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate() {
    this.belongsTo(User, { foreignKey: "userId", as: "user" });
    this.hasMany(Message, { foreignKey: "conversationId", as: "messages" });
    this.hasMany(ConversationSummary, { foreignKey: "conversationId", as: "summaries" });
    this.hasMany(ConversationTag, { foreignKey: "conversationId", as: "tags" });
    this.hasOne(ConversationArchive, { foreignKey: "conversationId", as: "archive" });
  }
}

Conversation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    conversationType: {
      type: DataTypes.ENUM("AI_CHAT", "LIVE_CHAT", "ORDER_SUPPORT", "PRODUCT_SUPPORT", "CUSTOMER_SERVICE", "GROUP_CHAT"),
      allowNull: false,
      defaultValue: "AI_CHAT",
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "CLOSED", "ARCHIVED", "DELETED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    endedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Conversation",
    tableName: "conversations",
    timestamps: true,
  }
);

export default Conversation;
