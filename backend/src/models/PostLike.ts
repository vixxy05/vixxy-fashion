
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface PostLikeAttributes {
  id: number;
  postId: number;
  userId: number;
  createdAt?: Date;
}

interface PostLikeCreationAttributes extends Optional<PostLikeAttributes, "id"> {}

class PostLike extends Model<PostLikeAttributes, PostLikeCreationAttributes>
  implements PostLikeAttributes
{
  public id!: number;
  public postId!: number;
  public userId!: number;
  public readonly createdAt!: Date;

  public static associate: () => void;
}

PostLike.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    postId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, tableName: "post_likes", timestamps: true, updatedAt: false }
);

export default PostLike;

