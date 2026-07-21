
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface ReviewAttributes {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  size?: string;
  color?: string;
  city?: string;
  likesCount?: number;
  helpfulCount?: number;
  hasPurchased?: boolean;
  reply?: string;
  repliedAt?: Date;
  status: "pending" | "approved" | "hidden";
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReviewCreationAttributes extends Optional<ReviewAttributes, "id"> {}

class Review
  extends Model<ReviewAttributes, ReviewCreationAttributes>
  implements ReviewAttributes
{
  public id!: number;
  public productId!: number;
  public userId!: number;
  public rating!: number;
  public title?: string;
  public comment?: string;
  public images?: string[];
  public size?: string;
  public color?: string;
  public city?: string;
  public likesCount?: number;
  public helpfulCount?: number;
  public hasPurchased?: boolean;
  public reply?: string;
  public repliedAt?: Date;
  public status!: "pending" | "approved" | "hidden";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate: () => void;
}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    size: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    likesCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    helpfulCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    hasPurchased: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    reply: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    repliedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "hidden"),
      allowNull: false,
      defaultValue: "approved",
    },
  },
  {
    sequelize,
    tableName: "reviews",
    timestamps: true,
  }
);

export default Review;
