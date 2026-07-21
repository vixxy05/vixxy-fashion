
import express from "express";
import {
  getReviewsByProduct,
  getReviewById,
  createReview,
  updateReview,
  likeReview,
  deleteReview,
  getAllReviews,
  updateReviewStatus,
  replyToReview,
} from "../controllers/reviewController";

const router = express.Router();

// Public routes
router.get("/product/:id", getReviewsByProduct);
router.get("/:id", getReviewById);
router.post("/", createReview);
router.put("/:id", updateReview);
router.post("/:id/like", likeReview);
router.delete("/:id", deleteReview);

// Admin routes
router.get("/admin/all", getAllReviews);
router.put("/admin/:id/status", updateReviewStatus);
router.post("/admin/:id/reply", replyToReview);

export default router;
