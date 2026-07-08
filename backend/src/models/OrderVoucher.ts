
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import Order from "./Order";
import Voucher from "./Voucher";

interface OrderVoucherAttributes {
  id: number;
  orderId: number;
  voucherId: number;
  discountApplied: number;
  createdAt?: Date;
}

interface OrderVoucherCreationAttributes extends Optional<OrderVoucherAttributes, "id"> {}

class OrderVoucher extends Model<OrderVoucherAttributes, OrderVoucherCreationAttributes>
  implements OrderVoucherAttributes
{
  public id!: number;
  public orderId!: number;
  public voucherId!: number;
  public discountApplied!: number;
  public readonly createdAt!: Date;

  public static associate(): void {
    OrderVoucher.belongsTo(Order, { foreignKey: "orderId", as: "order" });
    OrderVoucher.belongsTo(Voucher, { foreignKey: "voucherId", as: "voucher" });
  }
}

OrderVoucher.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "orders", key: "id" },
    },
    voucherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "vouchers", key: "id" },
    },
    discountApplied: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  },
  { sequelize, tableName: "orderVouchers", timestamps: true }
);

export default OrderVoucher;
