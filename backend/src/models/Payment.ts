
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Order from "./Order";
import PaymentGateway from "./PaymentGateway";

class Payment extends Model {
  public id!: number;
  public orderId!: number;
  public userId?: number;
  public gatewayId?: number;
  public paymentMethod!: "COD" | "ZALOPAY" | "MOMO" | "SEPAY" | "CARD";
  public amount!: number;
  public currency!: string;
  public transactionId?: string;
  public requestId?: string;
  public paymentUrl?: string;
  public qrCodeUrl?: string;
  public deeplink?: string;
  public paymentStatus!: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "CANCELLED" | "REFUNDED";
  public responseCode?: string;
  public responseMessage?: string;
  public paidAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: any) {
    this.belongsTo(models.Order, { foreignKey: "orderId", as: "order" });
    this.belongsTo(models.PaymentGateway, { foreignKey: "gatewayId", as: "gateway" });
  }
}

Payment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "orders", key: "id" },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
    gatewayId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "paymentGateways", key: "id" },
    },
    paymentMethod: {
      type: DataTypes.ENUM("COD", "ZALOPAY", "MOMO", "SEPAY", "CARD", "MOCK_QR"),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: "VND",
      allowNull: false,
    },
    transactionId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    requestId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    paymentUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    qrCodeUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    deeplink: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    paymentStatus: {
      type: DataTypes.ENUM("PENDING", "PROCESSING", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED"),
      defaultValue: "PENDING",
      allowNull: false,
    },
    responseCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    responseMessage: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Payment",
    tableName: "payments",
    timestamps: true,
  }
);

export default Payment;
