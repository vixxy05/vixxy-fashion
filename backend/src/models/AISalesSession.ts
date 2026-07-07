
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import User from "./User";
import Conversation from "./Conversation";

interface AISalesSessionAttributes {
  id: number;
  userId: number;
  conversationId?: number;
  sessionStatus: "ACTIVE" | "COMPLETED" | "ABANDONED";
  recommendedProducts?: object;
  totalInteractions: number;
  startedAt?: Date;
  endedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AISalesSessionCreationAttributes extends Optional<AISalesSessionAttributes, "id"> {}

class AISalesSession extends Model<AISalesSessionAttributes, AISalesSessionCreationAttributes> implements AISalesSessionAttributes {
  public id!: number;
  public userId!: number;
  public conversationId?: number;
  public sessionStatus!: "ACTIVE" | "COMPLETED" | "ABANDONED";
  public recommendedProducts?: object;
  public totalInteractions!: number;
  public startedAt?: Date;
  public endedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate() {
    AISalesSession.belongsTo(User, { foreignKey: "userId", as: "user" });
    AISalesSession.belongsTo(Conversation, { foreignKey: "conversationId", as: "conversation" });
  }
}

AISalesSession.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "conversations", key: "id" },
    },
    sessionStatus: {
      type: DataTypes.ENUM("ACTIVE", "COMPLETED", "ABANDONED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
    recommendedProducts: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    totalInteractions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    tableName: "ai_sales_sessions",
    timestamps: true,
  }
);

export default AISalesSession;
