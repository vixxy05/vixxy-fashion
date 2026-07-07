
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import User from "./User";
import Conversation from "./Conversation";

class AIKnowledgeSearchLog extends Model {
  public id!: number;
  public userId?: number;
  public conversationId?: number;
  public query!: string;
  public topK!: number;
  public responseTime!: number;
  public readonly createdAt!: Date;

  public static associate() {
    this.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    this.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });
  }
}

AIKnowledgeSearchLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'conversations', key: 'id' },
    },
    query: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    topK: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    responseTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "AIKnowledgeSearchLog",
    tableName: "ai_knowledge_search_logs",
    timestamps: true,
    updatedAt: false,
  }
);

export default AIKnowledgeSearchLog;
