
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import AIKnowledgeCategory from "./AIKnowledgeCategory";
import Product from "./Product";

class AIKnowledge extends Model {
  public id!: number;
  public productId?: number;
  public categoryId?: number;
  public knowledgeType!: 'PRODUCT' | 'FAQ' | 'POLICY' | 'SHIPPING' | 'PAYMENT' | 'RETURN_POLICY' | 'WARRANTY' | 'PROMOTION' | 'BRAND_STORY' | 'GENERAL';
  public title!: string;
  public content!: string;
  public embeddingId?: string;
  public source?: string;
  public status!: 'ACTIVE' | 'INACTIVE';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate() {
    this.belongsTo(AIKnowledgeCategory, { foreignKey: 'categoryId', as: 'category' });
    this.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
  }
}

AIKnowledge.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'products', key: 'id' },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'ai_knowledge_categories', key: 'id' },
    },
    knowledgeType: {
      type: DataTypes.ENUM('PRODUCT', 'FAQ', 'POLICY', 'SHIPPING', 'PAYMENT', 'RETURN_POLICY', 'WARRANTY', 'PROMOTION', 'BRAND_STORY', 'GENERAL'),
      allowNull: false,
      defaultValue: 'GENERAL',
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    embeddingId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
  },
  {
    sequelize,
    modelName: "AIKnowledge",
    tableName: "ai_knowledge",
    timestamps: true,
  }
);

export default AIKnowledge;
