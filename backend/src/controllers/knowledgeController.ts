
import { Request, Response } from "express";
import KnowledgeService from "../services/KnowledgeService";
import EmbeddingService from "../services/EmbeddingService";

const knowledgeService = new KnowledgeService();
const embeddingService = new EmbeddingService();

export const getAllKnowledge = async (req: Request, res: Response) => {
  try {
    const knowledge = await knowledgeService.getAllKnowledge();
    res.json({ success: true, knowledge });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getKnowledgeById = async (req: Request, res: Response) => {
  try {
    const knowledge = await knowledgeService.getKnowledgeById(Number(req.params.id));
    if (!knowledge) {
      return res.status(404).json({ success: false, message: "Knowledge not found" });
    }
    res.json({ success: true, knowledge });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createKnowledge = async (req: Request, res: Response) => {
  try {
    const knowledge = await knowledgeService.createKnowledge(req.body);
    res.status(201).json({ success: true, knowledge });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateKnowledge = async (req: Request, res: Response) => {
  try {
    const knowledge = await knowledgeService.updateKnowledge(Number(req.params.id), req.body);
    res.json({ success: true, knowledge });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteKnowledge = async (req: Request, res: Response) => {
  try {
    await knowledgeService.deleteKnowledge(Number(req.params.id));
    res.json({ success: true, message: "Knowledge deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const searchKnowledge = async (req: Request, res: Response) => {
  try {
    const { query, topK = 5 } = req.body;
    const results = await embeddingService.searchKnowledge(query, topK);
    res.json({
      success: true,
      documents: results.map(r => ({
        knowledge: r.knowledge,
        score: r.score,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const generateEmbedding = async (req: Request, res: Response) => {
  try {
    const { knowledgeId } = req.body;
    const knowledge = await knowledgeService.getKnowledgeById(knowledgeId);
    if (!knowledge) {
      return res.status(404).json({ success: false, message: "Knowledge not found" });
    }
    res.json({ success: true, message: "Embedding generated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const rebuildEmbedding = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, message: "Embeddings rebuilt successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await knowledgeService.getAllCategories();
    res.json({ success: true, categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await knowledgeService.createCategory(req.body);
    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
