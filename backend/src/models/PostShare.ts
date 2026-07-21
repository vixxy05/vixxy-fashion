
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface PostShareAttributes {
  id: number;
  postId: number;
  userId?: number;
  platform: string;
  createdAt?: Date;
}

interface PostShareCreationAttributes extends Optional<PostShareAttributes, "id"> {}

class PostShare extends Model<PostShareAttributes, PostShareCreationAttributes>
  implements PostShareAttributes
{
  public id!: number;
  public postId!: number;
  public userId?: number;
  public platform!: string;
  public readonly createdAt!: Date;

  public static associate: () => void;
}

PostShare.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    postId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: true },
    platform: { type: DataTypes.STRING(50), allowNull: false },
  },
  { sequelize, tableName: "post_shares", timestamps: true, updatedAt: false }
);

export default PostShare;

