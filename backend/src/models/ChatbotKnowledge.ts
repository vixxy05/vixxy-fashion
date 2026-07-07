
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class ChatbotKnowledge extends Model {
  public id!: number;
  public category!: string;
  public question!: string;
  public answer!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ChatbotKnowledge.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ChatbotKnowledge",
    tableName: "chatbot_knowledges",
    timestamps: true,
  }
);

export default ChatbotKnowledge;
