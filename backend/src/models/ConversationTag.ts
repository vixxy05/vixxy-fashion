
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Conversation from "./Conversation";

class ConversationTag extends Model {
  public id!: number;
  public conversationId!: number;
  public tagName!: string;
  public readonly createdAt!: Date;

  public static associate() {
    this.belongsTo(Conversation, { foreignKey: "conversationId" });
  }
}

ConversationTag.init(
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
    tagName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ConversationTag",
    tableName: "conversation_tags",
    timestamps: true,
    updatedAt: false,
  }
);

export default ConversationTag;
