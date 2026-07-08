
import express from "express";
import { requestRefund, getUserRefunds, getAllRefunds, processRefund } from "../controllers/refundController";

const router = express.Router();

// User routes
router.post("/request", requestRefund);
router.get("/user/:userId", getUserRefunds);

// Admin routes
router.get("/admin/all", getAllRefunds);
router.put("/admin/:id/process", processRefund);

export default router;
