
import db from "../models";
import EmbeddingService from "./EmbeddingService";

const { AIKnowledge, AIKnowledgeCategory } = db;

export class KnowledgeService {
  private embeddingService: EmbeddingService;

  constructor() {
    this.embeddingService = new EmbeddingService();
  }

  async getAllKnowledge() {
    return await AIKnowledge.findAll({ include: ['category', 'product'], order: [['createdAt', 'DESC']] });
  }

  async getKnowledgeById(id: number) {
    return await AIKnowledge.findByPk(id, { include: ['category', 'product'] });
  }

  async createKnowledge(data: {
    title: string;
    content: string;
    knowledgeType: string;
    productId?: number;
    categoryId?: number;
    source?: string;
  }) {
    return await this.embeddingService.createKnowledge(data);
  }

  async updateKnowledge(id: number, data: {
    title?: string;
    content?: string;
    knowledgeType?: string;
    productId?: number;
    categoryId?: number;
    source?: string;
    status?: string;
  }) {
    const knowledge = await AIKnowledge.findByPk(id);
    if (!knowledge) {
      throw new Error("Knowledge not found");
    }
    await knowledge.update(data);
    return knowledge;
  }

  async deleteKnowledge(id: number) {
    const knowledge = await AIKnowledge.findByPk(id);
    if (!knowledge) {
      throw new Error("Knowledge not found");
    }
    await knowledge.destroy();
  }

  // Get all categories
  async getAllCategories() {
    return await AIKnowledgeCategory.findAll({ order: [['name', 'ASC']] });
  }

  // Create category
  async createCategory(data: { name: string; description?: string }) {
    return await AIKnowledgeCategory.create(data);
  }
}

export default KnowledgeService;
