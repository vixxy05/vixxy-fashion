
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Conversation from "./Conversation";
import User from "./User";

class ConversationArchive extends Model {
  public id!: number;
  public conversationId!: number;
  public archiveReason?: string;
  public archivedById?: number;
  public readonly archivedAt!: Date;
  public readonly createdAt!: Date;

  public static associate() {
    this.belongsTo(Conversation, { foreignKey: "conversationId" });
    this.belongsTo(User, { foreignKey: "archivedById", as: "archivedByUser" });
  }
}

ConversationArchive.init(
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
    archiveReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    archivedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
    archivedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "ConversationArchive",
    tableName: "conversation_archives",
    timestamps: true,
    updatedAt: false,
  }
);

export default ConversationArchive;
