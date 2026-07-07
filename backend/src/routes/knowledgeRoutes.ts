
import { Router } from "express";
import {
  getAllKnowledge,
  getKnowledgeById,
  createKnowledge,
  updateKnowledge,
  deleteKnowledge,
  searchKnowledge,
  generateEmbedding,
  rebuildEmbedding,
  getAllCategories,
  createCategory,
} from "../controllers/knowledgeController";

const router = Router();

router.get("/", getAllKnowledge);
router.get("/categories", getAllCategories);
router.get("/:id", getKnowledgeById);
router.post("/", createKnowledge);
router.post("/categories", createCategory);
router.post("/search", searchKnowledge);
router.post("/embedding", generateEmbedding);
router.post("/rebuild", rebuildEmbedding);
router.put("/:id", updateKnowledge);
router.delete("/:id", deleteKnowledge);

export default router;
