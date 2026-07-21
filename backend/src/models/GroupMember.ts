
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface GroupMemberAttributes {
  id: number;
  groupId: number;
  userId: number;
  role: string;
  createdAt?: Date;
}

interface GroupMemberCreationAttributes extends Optional<GroupMemberAttributes, "id"> {}

class GroupMember extends Model<GroupMemberAttributes, GroupMemberCreationAttributes>
  implements GroupMemberAttributes
{
  public id!: number;
  public groupId!: number;
  public userId!: number;
  public role!: string;
  public readonly createdAt!: Date;

  public static associate: () => void;
}

GroupMember.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    groupId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    role: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "member" },
  },
  { sequelize, tableName: "group_members", timestamps: true, updatedAt: false }
);

export default GroupMember;

