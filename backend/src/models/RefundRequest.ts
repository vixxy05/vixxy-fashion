
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import User from "./User";
import Order from "./Order";

interface RefundRequestAttributes {
  id: number;
  orderId: number;
  userId: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminId?: number;
  adminReason?: string;
  processedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RefundRequestCreationAttributes extends Optional<RefundRequestAttributes, "id"> {}

class RefundRequest extends Model<RefundRequestAttributes, RefundRequestCreationAttributes>
  implements RefundRequestAttributes
{
  public id!: number;
  public orderId!: number;
  public userId!: number;
  public reason!: string;
  public status!: "PENDING" | "APPROVED" | "REJECTED";
  public adminId?: number;
  public adminReason?: string;
  public processedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(): void {
    RefundRequest.belongsTo(Order, { foreignKey: "orderId", as: "order" });
    RefundRequest.belongsTo(User, { foreignKey: "userId", as: "user" });
    RefundRequest.belongsTo(User, { foreignKey: "adminId", as: "admin" });
  }
}

RefundRequest.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "orders", key: "id" },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    reason: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
    adminReason: { type: DataTypes.TEXT, allowNull: true },
    processedAt: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, tableName: "refundRequests", timestamps: true }
);

export default RefundRequest;
