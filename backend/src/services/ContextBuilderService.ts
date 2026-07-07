
import db from "../models";
import EmbeddingService from "./EmbeddingService";

const { AIKnowledgeSearchLog } = db;

export class ContextBuilderService {
  private embeddingService: EmbeddingService;

  constructor() {
    this.embeddingService = new EmbeddingService();
  }

  async buildContext(
    query: string,
    conversationId?: number,
    userId?: number,
    topK: number = 5
  ) {
    const startTime = Date.now();

    // Search knowledge base
    const searchResults = await this.embeddingService.searchKnowledge(query, topK);

    const responseTime = Date.now() - startTime;

    // Log search
    await AIKnowledgeSearchLog.create({
      userId,
      conversationId,
      query,
      topK,
      responseTime,
    });

    // Build context string
    let context = "";
    searchResults.forEach((result, index) => {
      const { knowledge, score } = result;
      context += `[${index + 1}] ${knowledge.title}\n`;
      context += `${knowledge.content}\n\n`;
    });

    return {
      context,
      documents: searchResults,
      responseTime,
    };
  }
}

export default ContextBuilderService;
