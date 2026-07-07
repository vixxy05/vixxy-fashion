
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class AIKnowledgeCategory extends Model {
  public id!: number;
  public name!: string;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AIKnowledgeCategory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "AIKnowledgeCategory",
    tableName: "ai_knowledge_categories",
    timestamps: true,
  }
);

export default AIKnowledgeCategory;
