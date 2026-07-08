
import express from "express";
import { getActiveBanners, getAllBanners, createBanner, updateBanner, deleteBanner } from "../controllers/bannerController";

const router = express.Router();

// Public routes
router.get("/", getActiveBanners);

// Admin routes
router.get("/admin/all", getAllBanners);
router.post("/admin", createBanner);
router.put("/admin/:id", updateBanner);
router.delete("/admin/:id", deleteBanner);

export default router;
