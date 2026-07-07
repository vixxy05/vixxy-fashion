
import { Router } from "express";
import {
  createSession,
  getSession,
  getSessionList,
  transferSession,
  closeSession,
} from "../controllers/chatSessionController";

const router = Router();

router.post("/", createSession);
router.get("/:id", getSession);
router.get("/", getSessionList);
router.post("/transfer", transferSession);
router.post("/close", closeSession);

export default router;
