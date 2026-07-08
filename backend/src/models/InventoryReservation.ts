
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import Product from "./Product";
import Order from "./Order";

interface InventoryReservationAttributes {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  status: "RESERVED" | "RELEASED" | "CONFIRMED";
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface InventoryReservationCreationAttributes extends Optional<InventoryReservationAttributes, "id"> {}

class InventoryReservation extends Model<InventoryReservationAttributes, InventoryReservationCreationAttributes>
  implements InventoryReservationAttributes
{
  public id!: number;
  public orderId!: number;
  public productId!: number;
  public quantity!: number;
  public status!: "RESERVED" | "RELEASED" | "CONFIRMED";
  public expiresAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(): void {
    InventoryReservation.belongsTo(Order, { foreignKey: "orderId", as: "order" });
    InventoryReservation.belongsTo(Product, { foreignKey: "productId", as: "product" });
  }
}

InventoryReservation.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "orders", key: "id" },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "products", key: "id" },
    },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM("RESERVED", "RELEASED", "CONFIRMED"),
      allowNull: false,
      defaultValue: "RESERVED",
    },
    expiresAt: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, tableName: "inventoryReservations", timestamps: true }
);

export default InventoryReservation;
