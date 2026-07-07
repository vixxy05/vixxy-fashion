
import { Router } from "express";
import {
  sendMessage,
  getSessionMessages,
  getChatHistory,
} from "../controllers/chatMessageController";

const router = Router();

router.post("/", sendMessage);
router.get("/:sessionId", getSessionMessages);
router.get("/", getChatHistory);

export default router;
