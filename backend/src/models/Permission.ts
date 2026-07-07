import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import Role from "./Role";

interface PermissionAttributes {
  id: number;
  permissionCode: string;
  permissionName: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PermissionCreationAttributes extends Optional<PermissionAttributes, "id"> {}

class Permission
  extends Model<PermissionAttributes, PermissionCreationAttributes>
  implements PermissionAttributes {
  public id!: number;
  public permissionCode!: string;
  public permissionName!: string;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associate(): void {
    Permission.belongsToMany(Role, { 
      through: "RolePermissions", 
      foreignKey: "permissionId", 
      as: "roles" 
    });
  }
}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    permissionCode: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    permissionName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "permissions",
    timestamps: true,
  }
);

export default Permission;
