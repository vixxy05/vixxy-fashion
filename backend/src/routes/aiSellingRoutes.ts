
import { Router } from "express";
import AISellingController from "../controllers/AISellingController";

const router = Router();

router.post("/chat", AISellingController.sendMessage);
router.get("/dashboard", AISellingController.getDashboardStats);

export default router;
