
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Conversation from "./Conversation";
import User from "./User";

class ConversationSummary extends Model {
  public id!: number;
  public conversationId!: number;
  public summaryContent!: string;
  public generatedBy!: "AI" | "SYSTEM" | "STAFF";
  public generatedById?: number;
  public readonly createdAt!: Date;

  public static associate() {
    this.belongsTo(Conversation, { foreignKey: "conversationId" });
    this.belongsTo(User, { foreignKey: "generatedById", as: "generatedByUser" });
  }
}

ConversationSummary.init(
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
    summaryContent: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    generatedBy: {
      type: DataTypes.ENUM("AI", "SYSTEM", "STAFF"),
      allowNull: false,
      defaultValue: "AI",
    },
    generatedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
  },
  {
    sequelize,
    modelName: "ConversationSummary",
    tableName: "conversation_summaries",
    timestamps: true,
    updatedAt: false,
  }
);

export default ConversationSummary;
