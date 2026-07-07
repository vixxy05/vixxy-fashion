import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import User from "./User";

interface OrderAttributes {
  id: number;
  userId: number;
  orderCode: string;
  totalAmount: number;
  orderStatus: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPhone: string;
  shippingName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, "id"> {}

class Order
  extends Model<OrderAttributes, OrderCreationAttributes>
  implements OrderAttributes
{
  public id!: number;
  public userId!: number;
  public orderCode!: string;
  public totalAmount!: number;
  public orderStatus!: string;
  public shippingAddress!: string;
  public shippingCity!: string;
  public shippingPhone!: string;
  public shippingName!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associate(): void {
    Order.belongsTo(User, {
      foreignKey: "userId",
      as: "user",
    });
  }
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    orderCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    orderStatus: {
      type: DataTypes.ENUM(
        "pending",
        "paid",
        "processing",
        "shipping",
        "completed",
        "cancelled",
        "refunded"
      ),
      allowNull: false,
      defaultValue: "pending",
    },
    shippingAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    shippingCity: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    shippingPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    shippingName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "orders",
    timestamps: true,
  }
);

export default Order;
