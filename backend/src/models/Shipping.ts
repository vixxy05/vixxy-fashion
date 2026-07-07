import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import Order from "./Order";

interface ShippingAttributes {
  id: number;
  orderId: number;
  carrier?: string;
  trackingCode?: string;
  shippingStatus: string;
  estimatedDelivery?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ShippingCreationAttributes extends Optional<ShippingAttributes, "id"> {}

class Shipping
  extends Model<ShippingAttributes, ShippingCreationAttributes>
  implements ShippingAttributes
{
  public id!: number;
  public orderId!: number;
  public carrier?: string;
  public trackingCode?: string;
  public shippingStatus!: string;
  public estimatedDelivery?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associate(): void {
    Shipping.belongsTo(Order, {
      foreignKey: "orderId",
      as: "order",
    });
  }
}

Shipping.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "orders",
        key: "id",
      },
    },
    carrier: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    trackingCode: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    shippingStatus: {
      type: DataTypes.ENUM(
        "pending",
        "preparing",
        "picked_up",
        "in_transit",
        "delivered",
        "cancelled"
      ),
      allowNull: false,
      defaultValue: "pending",
    },
    estimatedDelivery: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "shippings",
    timestamps: true,
  }
);

export default Shipping;
