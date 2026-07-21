
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface PostAttributes {
  id: number;
  title: string;
  content: string;
  thumbnail?: string;
  coverImage?: string;
  publicLink?: string;
  productId?: number;
  authorId: number;
  status: "public" | "private";
  postType: "user" | "group";
  groupId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PostCreationAttributes extends Optional<PostAttributes, "id"> {}

class Post extends Model<PostAttributes, PostCreationAttributes>
  implements PostAttributes
{
  public id!: number;
  public title!: string;
  public content!: string;
  public thumbnail?: string;
  public coverImage?: string;
  public publicLink?: string;
  public productId?: number;
  public authorId!: number;
  public status!: "public" | "private";
  public postType!: "user" | "group";
  public groupId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate: () => void;
}

Post.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    thumbnail: { type: DataTypes.STRING(500), allowNull: true },
    coverImage: { type: DataTypes.STRING(500), allowNull: true },
    publicLink: { type: DataTypes.STRING(500), allowNull: true },
    productId: { type: DataTypes.INTEGER, allowNull: true },
    authorId: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM("public", "private"), allowNull: false, defaultValue: "public" },
    postType: { type: DataTypes.ENUM("user", "group"), allowNull: false, defaultValue: "user" },
    groupId: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize, tableName: "posts", timestamps: true }
);

export default Post;

