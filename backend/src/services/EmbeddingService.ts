
import db from "../models";

const { AIKnowledge, AIEmbedding } = db;

export class EmbeddingService {
  // Simple hash-based embedding for demonstration
  // In production, use OpenAI Embeddings, sentence-transformers, etc.
  generateEmbedding(text: string): number[] {
    const embedding = new Array(384).fill(0);
    for (let i = 0; i < text.length && i < 384; i++) {
      embedding[i] = (text.charCodeAt(i) % 100) / 100 - 0.5;
    }
    return embedding;
  }

  // Calculate cosine similarity between two vectors
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
    const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (normA * normB);
  }

  // Create knowledge entry with embedding
  async createKnowledge(data: {
    title: string;
    content: string;
    knowledgeType: string;
    productId?: number;
    categoryId?: number;
    source?: string;
  }) {
    const knowledge = await AIKnowledge.create({
      title: data.title,
      content: data.content,
      knowledgeType: data.knowledgeType as any,
      productId: data.productId,
      categoryId: data.categoryId,
      source: data.source,
      status: 'ACTIVE',
    });

    const embedding = this.generateEmbedding(data.title + " " + data.content);
    await AIEmbedding.create({
      knowledgeId: knowledge.id,
      embeddingModel: 'simple-hash',
      vectorId: `vec-${knowledge.id}`,
      dimension: 384,
    });

    return knowledge;
  }

  // Search knowledge base
  async searchKnowledge(query: string, topK: number = 5, scoreThreshold: number = 0.3) {
    const queryEmbedding = this.generateEmbedding(query);
    const allKnowledge = await AIKnowledge.findAll({
      where: { status: 'ACTIVE' },
      include: ['category', 'product'],
    });

    const results = allKnowledge.map(knowledge => {
      const knowledgeText = knowledge.title + " " + knowledge.content;
      const knowledgeEmbedding = this.generateEmbedding(knowledgeText);
      const score = this.cosineSimilarity(queryEmbedding, knowledgeEmbedding);
      return { knowledge, score };
    });

    return results
      .filter(r => r.score >= scoreThreshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

export default EmbeddingService;
