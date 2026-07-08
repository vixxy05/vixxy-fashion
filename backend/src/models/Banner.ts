
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface BannerAttributes {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BannerCreationAttributes extends Optional<BannerAttributes, "id"> {}

class Banner extends Model<BannerAttributes, BannerCreationAttributes>
  implements BannerAttributes
{
  public id!: number;
  public title!: string;
  public description?: string;
  public imageUrl!: string;
  public linkUrl?: string;
  public isActive!: boolean;
  public displayOrder!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Banner.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    imageUrl: { type: DataTypes.STRING(500), allowNull: false },
    linkUrl: { type: DataTypes.STRING(500), allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    displayOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { sequelize, tableName: "banners", timestamps: true }
);

export default Banner;
