
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import User from "./User";

interface CartAttributes {
  id: number;
  userId: number;
  status: "ACTIVE" | "CHECKOUT" | "ABANDONED" | "COMPLETED";
  totalAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CartCreationAttributes extends Optional<CartAttributes, "id"> {}

class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
  public id!: number;
  public userId!: number;
  public status!: "ACTIVE" | "CHECKOUT" | "ABANDONED" | "COMPLETED";
  public totalAmount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate() {
    Cart.belongsTo(User, { foreignKey: "userId", as: "user" });
  }
}

Cart.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "CHECKOUT", "ABANDONED", "COMPLETED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  {
    sequelize,
    tableName: "carts",
    timestamps: true,
  }
);

export default Cart;
