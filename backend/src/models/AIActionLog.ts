
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import AISalesSession from "./AISalesSession";

interface AIActionLogAttributes {
  id: number;
  sessionId: number;
  actionType: "SEARCH_PRODUCT" | "RECOMMEND_PRODUCT" | "ADD_TO_CART" | "UPDATE_CART" | "REMOVE_CART" | "CREATE_ORDER" | "PAYMENT_GUIDE";
  actionData?: object;
  createdAt?: Date;
}

interface AIActionLogCreationAttributes extends Optional<AIActionLogAttributes, "id"> {}

class AIActionLog extends Model<AIActionLogAttributes, AIActionLogCreationAttributes> implements AIActionLogAttributes {
  public id!: number;
  public sessionId!: number;
  public actionType!: "SEARCH_PRODUCT" | "RECOMMEND_PRODUCT" | "ADD_TO_CART" | "UPDATE_CART" | "REMOVE_CART" | "CREATE_ORDER" | "PAYMENT_GUIDE";
  public actionData?: object;
  public readonly createdAt!: Date;

  public static associate() {
    AIActionLog.belongsTo(AISalesSession, { foreignKey: "sessionId", as: "salesSession" });
  }
}

AIActionLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sessionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "ai_sales_sessions", key: "id" },
    },
    actionType: {
      type: DataTypes.ENUM("SEARCH_PRODUCT", "RECOMMEND_PRODUCT", "ADD_TO_CART", "UPDATE_CART", "REMOVE_CART", "CREATE_ORDER", "PAYMENT_GUIDE"),
      allowNull: false,
    },
    actionData: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "ai_action_logs",
    timestamps: true,
    updatedAt: false,
  }
);

export default AIActionLog;
