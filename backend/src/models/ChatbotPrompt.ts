
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class ChatbotPrompt extends Model {
  public id!: number;
  public promptName!: string;
  public promptContent!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ChatbotPrompt.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    promptName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    promptContent: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "ChatbotPrompt",
    tableName: "chatbot_prompts",
    timestamps: true,
  }
);

export default ChatbotPrompt;
