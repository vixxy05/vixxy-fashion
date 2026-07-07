
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import User from "./User";

class ChatQueue extends Model {
  public id!: number;
  public customerId!: number;
  public queueNumber!: number;
  public status!: "WAITING" | "SERVED" | "CANCELLED";
  public readonly createdAt!: Date;

  public static associate() {
    this.belongsTo(User, { foreignKey: "customerId", as: "customer" });
  }
}

ChatQueue.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customerId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" } },
    queueNumber: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM("WAITING", "SERVED", "CANCELLED"), allowNull: false, defaultValue: "WAITING" },
  },
  { sequelize, modelName: "ChatQueue", tableName: "chat_queue", timestamps: true, updatedAt: false }
);

export default ChatQueue;
