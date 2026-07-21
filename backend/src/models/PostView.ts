
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface PostViewAttributes {
  id: number;
  postId: number;
  userId?: number;
  ipAddress?: string;
  createdAt?: Date;
}

interface PostViewCreationAttributes extends Optional<PostViewAttributes, "id"> {}

class PostView extends Model<PostViewAttributes, PostViewCreationAttributes>
  implements PostViewAttributes
{
  public id!: number;
  public postId!: number;
  public userId?: number;
  public ipAddress?: string;
  public readonly createdAt!: Date;

  public static associate: () => void;
}

PostView.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    postId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: true },
    ipAddress: { type: DataTypes.STRING(45), allowNull: true },
  },
  { sequelize, tableName: "post_views", timestamps: true, updatedAt: false }
);

export default PostView;

