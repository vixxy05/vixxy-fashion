
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface VoucherAttributes {
  id: number;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface VoucherCreationAttributes extends Optional<VoucherAttributes, "id"> {}

class Voucher extends Model<VoucherAttributes, VoucherCreationAttributes>
  implements VoucherAttributes
{
  public id!: number;
  public code!: string;
  public discountType!: "PERCENTAGE" | "FIXED";
  public discountValue!: number;
  public minOrderAmount?: number;
  public maxDiscountAmount?: number;
  public usageLimit?: number;
  public usedCount!: number;
  public expiresAt?: Date;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Voucher.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    discountType: {
      type: DataTypes.ENUM("PERCENTAGE", "FIXED"),
      allowNull: false,
    },
    discountValue: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    minOrderAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    maxDiscountAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    usageLimit: { type: DataTypes.INTEGER, allowNull: true },
    usedCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    expiresAt: { type: DataTypes.DATE, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { sequelize, tableName: "vouchers", timestamps: true }
);

export default Voucher;
