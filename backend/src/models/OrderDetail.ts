import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import Order from "./Order";
import Product from "./Product";

interface OrderDetailAttributes {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  size?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderDetailCreationAttributes extends Optional<OrderDetailAttributes, "id"> {}

class OrderDetail
  extends Model<OrderDetailAttributes, OrderDetailCreationAttributes>
  implements OrderDetailAttributes
{
  public id!: number;
  public orderId!: number;
  public productId!: number;
  public quantity!: number;
  public unitPrice!: number;
  public size?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associate(models: any): void {
    OrderDetail.belongsTo(models.Order, {
      foreignKey: "orderId",
      as: "order",
    });
    OrderDetail.belongsTo(models.Product, {
      foreignKey: "productId",
      as: "product",
    });
  }
}

OrderDetail.init(
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
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    size: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "order_details",
    timestamps: true,
  }
);

export default OrderDetail;
