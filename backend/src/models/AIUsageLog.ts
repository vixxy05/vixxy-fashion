
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Conversation from "./Conversation";
import User from "./User";

class AIUsageLog extends Model {
  public id!: number;
  public conversationId!: number;
  public userId!: number;
  public promptTokens?: number;
  public completionTokens?: number;
  public totalTokens?: number;
  public modelName?: string;
  public responseTime?: number;
  public readonly createdAt!: Date;

  public static associate() {
    this.belongsTo(Conversation, { foreignKey: "conversationId", as: "conversation" });
    this.belongsTo(User, { foreignKey: "userId", as: "user" });
  }
}

AIUsageLog.init(
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    promptTokens: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    completionTokens: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    totalTokens: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    modelName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    responseTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "AIUsageLog",
    tableName: "ai_usage_logs",
    timestamps: true,
    updatedAt: false,
  }
);

export default AIUsageLog;
