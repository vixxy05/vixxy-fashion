
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import User from "./User";
import Product from "./Product";

interface AIRecommendationLogAttributes {
  id: number;
  userId: number;
  productId: number;
  recommendationType: "PRODUCT" | "UPSELL" | "CROSS_SELL" | "SIZE" | "COLLECTION";
  score?: number;
  createdAt?: Date;
}

interface AIRecommendationLogCreationAttributes extends Optional<AIRecommendationLogAttributes, "id"> {}

class AIRecommendationLog extends Model<AIRecommendationLogAttributes, AIRecommendationLogCreationAttributes> implements AIRecommendationLogAttributes {
  public id!: number;
  public userId!: number;
  public productId!: number;
  public recommendationType!: "PRODUCT" | "UPSELL" | "CROSS_SELL" | "SIZE" | "COLLECTION";
  public score?: number;
  public readonly createdAt!: Date;

  public static associate() {
    AIRecommendationLog.belongsTo(User, { foreignKey: "userId", as: "user" });
    AIRecommendationLog.belongsTo(Product, { foreignKey: "productId", as: "product" });
  }
}

AIRecommendationLog.init(
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
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "products", key: "id" },
    },
    recommendationType: {
      type: DataTypes.ENUM("PRODUCT", "UPSELL", "CROSS_SELL", "SIZE", "COLLECTION"),
      allowNull: false,
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "ai_recommendation_logs",
    timestamps: true,
    updatedAt: false,
  }
);

export default AIRecommendationLog;
