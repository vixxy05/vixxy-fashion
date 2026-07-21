
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface PostCommentAttributes {
  id: number;
  postId: number;
  userId: number;
  parentId?: number;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PostCommentCreationAttributes extends Optional<PostCommentAttributes, "id"> {}

class PostComment extends Model<PostCommentAttributes, PostCommentCreationAttributes>
  implements PostCommentAttributes
{
  public id!: number;
  public postId!: number;
  public userId!: number;
  public parentId?: number;
  public content!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate: () => void;
}

PostComment.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    postId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    parentId: { type: DataTypes.INTEGER, allowNull: true },
    content: { type: DataTypes.TEXT, allowNull: false },
  },
  { sequelize, tableName: "post_comments", timestamps: true }
);

export default PostComment;

