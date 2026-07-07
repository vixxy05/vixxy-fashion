import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import User from "./User";

interface LoginHistoryAttributes {
  id: number;
  userId: number;
  ipAddress?: string;
  deviceInfo?: string;
  browserInfo?: string;
  loginAt?: Date;
  success: boolean;
  failureReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LoginHistoryCreationAttributes extends Optional<LoginHistoryAttributes, "id"> {}

class LoginHistory
  extends Model<LoginHistoryAttributes, LoginHistoryCreationAttributes>
  implements LoginHistoryAttributes {
  public id!: number;
  public userId!: number;
  public ipAddress?: string;
  public deviceInfo?: string;
  public browserInfo?: string;
  public loginAt?: Date;
  public success!: boolean;
  public failureReason?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associate(): void {
    LoginHistory.belongsTo(User, {
      foreignKey: "userId",
      as: "user",
    });
  }
}

LoginHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ipAddress: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    deviceInfo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    browserInfo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    loginAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    failureReason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "login_history",
    timestamps: true,
  }
);

export default LoginHistory;
