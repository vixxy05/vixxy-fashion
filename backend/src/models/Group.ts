
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface GroupAttributes {
  id: number;
  name: string;
  description?: string;
  coverImage?: string;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface GroupCreationAttributes extends Optional<GroupAttributes, "id"> {}

class Group extends Model<GroupAttributes, GroupCreationAttributes>
  implements GroupAttributes
{
  public id!: number;
  public name!: string;
  public description?: string;
  public coverImage?: string;
  public createdBy!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate: () => void;
}

Group.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    coverImage: { type: DataTypes.STRING(500), allowNull: true },
    createdBy: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, tableName: "groups", timestamps: true }
);

export default Group;

