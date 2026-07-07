
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Payment from "./Payment";

class PaymentLog extends Model {
  public id!: number;
  public paymentId?: number;
  public requestData?: string;
  public responseData?: string;
  public logType!: "REQUEST" | "RESPONSE" | "CALLBACK" | "WEBHOOK" | "REFUND" | "ERROR";
  public ipAddress?: string;
  public readonly createdAt!: Date;

  public static associate() {
    this.belongsTo(Payment, { foreignKey: "paymentId", as: "payment" });
  }
}

PaymentLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    paymentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "payments", key: "id" },
    },
    requestData: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    responseData: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    logType: {
      type: DataTypes.ENUM("REQUEST", "RESPONSE", "CALLBACK", "WEBHOOK", "REFUND", "ERROR"),
      allowNull: false,
    },
    ipAddress: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "PaymentLog",
    tableName: "paymentLogs",
    timestamps: true,
    updatedAt: false,
  }
);

export default PaymentLog;
