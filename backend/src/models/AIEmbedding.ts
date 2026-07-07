
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import AIKnowledge from "./AIKnowledge";

class AIEmbedding extends Model {
  public id!: number;
  public knowledgeId!: number;
  public embeddingModel!: string;
  public vectorId?: string;
  public dimension!: number;
  public readonly createdAt!: Date;

  public static associate() {
    this.belongsTo(AIKnowledge, { foreignKey: 'knowledgeId', as: 'knowledge' });
  }
}

AIEmbedding.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    knowledgeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'ai_knowledge', key: 'id' },
    },
    embeddingModel: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'sentence-transformers/all-MiniLM-L6-v2',
    },
    vectorId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    dimension: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 384,
    },
  },
  {
    sequelize,
    modelName: "AIEmbedding",
    tableName: "ai_embeddings",
    timestamps: true,
    updatedAt: false,
  }
);

export default AIEmbedding;
