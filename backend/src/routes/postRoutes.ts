
import express from "express";
import {
  getPublicPosts,
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getPostLikes,
  addComment,
  deleteComment,
  getPostComments,
  sharePost,
  getPostShares,
  incrementPostView,
  getPostViews,
  getPostStats,
} from "../controllers/postController";

const router = express.Router();

// Public routes
router.get("/", getPublicPosts);
router.get("/:id", getPostById);
router.get("/:id/likes", getPostLikes);
router.get("/:id/comments", getPostComments);
router.get("/:id/shares", getPostShares);
router.get("/:id/views", getPostViews);
router.get("/:id/stats", getPostStats);
router.post("/:id/view", incrementPostView);

// Like/Unlike
router.post("/:id/like", likePost);
router.delete("/:id/like", unlikePost);

// Comments
router.post("/:id/comment", addComment);
router.delete("/comments/:id", deleteComment);

// Share
router.post("/:id/share", sharePost);

// Admin routes
router.get("/admin/all", getAllPosts);
router.post("/admin", createPost);
router.put("/admin/:id", updatePost);
router.delete("/admin/:id", deletePost);

export default router;
