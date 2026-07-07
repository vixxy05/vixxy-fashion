
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Payment from "./Payment";

class PaymentGateway extends Model {
  public id!: number;
  public name!: string;
  public provider!: "ZALOPAY" | "MOMO" | "COD";
  public apiUrl?: string;
  public partnerCode?: string;
  public appId?: string;
  public key1?: string;
  public key2?: string;
  public secretKey?: string;
  public isSandbox!: boolean;
  public status!: "ACTIVE" | "INACTIVE";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate() {
    this.hasMany(Payment, { foreignKey: "gatewayId", as: "payments" });
  }
}

PaymentGateway.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    provider: {
      type: DataTypes.ENUM("ZALOPAY", "MOMO", "COD"),
      allowNull: false,
    },
    apiUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    partnerCode: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    appId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    key1: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    key2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    secretKey: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isSandbox: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "PaymentGateway",
    tableName: "paymentGateways",
    timestamps: true,
  }
);

export default PaymentGateway;
