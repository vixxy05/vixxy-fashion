
import { Request, Response } from "express";
import db from "../models";
import { emitToAll } from "../socket/socketServer";

// Get all public posts
export const getPublicPosts = async (req: Request, res: Response) => {
  try {
    const posts = await db.Post.findAll({
      where: { status: "public" },
      include: [
        { model: db.User, as: "author", attributes: ["id", "fullName", "avatar"] },
        { model: db.Product, as: "product" },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, data: posts });
  } catch (error) {
    console.error("Get public posts error:", error);
    res.status(500).json({ success: false, message: "Failed to get posts" });
  }
};

// Get all posts (admin)
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await db.Post.findAll({
      include: [
        { model: db.User, as: "author", attributes: ["id", "fullName", "avatar"] },
        { model: db.Product, as: "product" },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, data: posts });
  } catch (error) {
    console.error("Get all posts error:", error);
    res.status(500).json({ success: false, message: "Failed to get posts" });
  }
};

// Get post by id
export const getPostById = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const postId = Number(idParam);
    const post = await db.Post.findByPk(postId, {
      include: [
        { model: db.User, as: "author", attributes: ["id", "fullName", "avatar"] },
        { model: db.Product, as: "product" },
      ],
    });
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    res.json({ success: true, data: post });
  } catch (error) {
    console.error("Get post by id error:", error);
    res.status(500).json({ success: false, message: "Failed to get post" });
  }
};

// Create post
export const createPost = async (req: Request, res: Response) => {
  try {
    const post = await db.Post.create(req.body);
    emitToAll("post:created", post);
    res.json({ success: true, data: post });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ success: false, message: "Failed to create post" });
  }
};

// Update post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const postId = Number(idParam);
    const post = await db.Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    await post.update(req.body);
    emitToAll("post:updated", post);
    res.json({ success: true, data: post });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ success: false, message: "Failed to update post" });
  }
};

// Delete post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const postId = Number(idParam);
    const post = await db.Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    await post.destroy();
    emitToAll("post:deleted", postId);
    res.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ success: false, message: "Failed to delete post" });
  }
};

// Like post
export const likePost = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const postId = Number(idParam);
    const { userId } = req.body;

    const existingLike = await db.PostLike.findOne({ where: { postId, userId } });
    if (existingLike) {
      return res.status(400).json({ success: false, message: "Already liked" });
    }

    const like = await db.PostLike.create({ postId, userId });
    const likeCount = await db.PostLike.count({ where: { postId } });
    emitToAll("post:liked", { postId, likeCount, userId });
    res.json({ success: true, data: like, likeCount });
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({ success: false, message: "Failed to like post" });
  }
};

// Unlike post
export const unlikePost = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const postId = Number(idParam);
    const { userId } = req.body;

    const like = await db.PostLike.findOne({ where: { postId, userId } });
    if (!like) {
      return res.status(404).json({ success: false, message: "Like not found" });
    }

    await like.destroy();
    const likeCount = await db.PostLike.count({ where: { postId } });
    emitToAll("post:unliked", { postId, likeCount, userId });
    res.json({ success: true, message: "Post unliked", likeCount });
  } catch (error) {
    console.error("Unlike post error:", error);
    res.status(500).json({ success: false, message: "Failed to unlike post" });
  }
};

// Get post likes count
export const getPostLikes = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const postId = Number(idParam);
    const count = await db.PostLike.count({ where: { postId } });
    res.json({ success: true, data: count });
  } catch (error) {
    console.error("Get post likes error:", error);
    res.status(500).json({ success: false, message: "Failed to get likes count" });
  }
};

// Add comment
export const addComment = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const postId = Number(idParam);
    const comment = await db.PostComment.create({ ...req.body, postId });
    const commentCount = await db.PostComment.count({ where: { postId } });
    emitToAll("post:commented", { postId, comment, commentCount });
    res.json({ success: true, data: comment, commentCount });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ success: false, message: "Failed to add comment" });
  }
};

// Delete comment
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const commentId = Number(idParam);
    const comment = await db.PostComment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }
    const postId = comment.postId;
    await comment.destroy();
    const commentCount = await db.PostComment.count({ where: { postId } });
    emitToAll("post:commentDeleted", { postId, commentId, commentCount });
    res.json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ success: false, message: "Failed to delete comment" });
  }
};

// Get post comments
export const getPostComments = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const postId = Number(idParam);
    const comments = await db.PostComment.findAll({
      where: { postId, parentId: null },
      include: [
        { model: db.User, as: "user", attributes: ["id", "fullName", "avatar"] },
        {
          model: db.PostComment,
          as: "replies",
          include: [{ model: db.User, as: "user", attributes: ["id", "fullName", "avatar"] }],
        },
      ],
      order: [["createdAt", "ASC"]],
    });
    res.json({ success: true, data: comments });
  } catch (error) {
    console.error("Get post comments error:", error);
    res.status(500).json({ success: false, message: "Failed to get comments" });
  }
};

// Share post
export const sharePost = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const postId = Number(idParam);
    const share = await db.PostShare.create({ ...req.body, postId });
    const shareCount = await db.PostShare.count({ where: { postId } });
    emitToAll("post:shared", { postId, shareCount });
    res.json({ success: true, data: share, shareCount });
  } catch (error) {
    console.error("Share post error:", error);
    res.status(500).json({ success: false, message: "Failed to share post" });
  }
};

// Get post shares count
export const getPostShares = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const postId = Number(idParam);
    const count = await db.PostShare.count({ where: { postId } });
    res.json({ success: true, data: count });
  } catch (error) {
    console.error("Get post shares error:", error);
    res.status(500).json({ success: false, message: "Failed to get shares count" });
  }
};

// Increment post view
export const incrementPostView = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const postId = Number(idParam);
    const { userId, ipAddress } = req.body;
    
    await db.PostView.create({ postId, userId, ipAddress });
    const viewCount = await db.PostView.count({ where: { postId } });
    emitToAll("post:viewed", { postId, viewCount });
    res.json({ success: true, viewCount });
  } catch (error) {
    console.error("Increment post view error:", error);
    res.status(500).json({ success: false, message: "Failed to increment view" });
  }
};

// Get post views count
export const getPostViews = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const postId = Number(idParam);
    const count = await db.PostView.count({ where: { postId } });
    res.json({ success: true, data: count });
  } catch (error) {
    console.error("Get post views error:", error);
    res.status(500).json({ success: false, message: "Failed to get views count" });
  }
};

// Get post stats
export const getPostStats = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const postId = Number(idParam);
    
    const [likes, comments, shares, views] = await Promise.all([
      db.PostLike.count({ where: { postId } }),
      db.PostComment.count({ where: { postId } }),
      db.PostShare.count({ where: { postId } }),
      db.PostView.count({ where: { postId } }),
    ]);
    
    res.json({ success: true, data: { likes, comments, shares, views } });
  } catch (error) {
    console.error("Get post stats error:", error);
    res.status(500).json({ success: false, message: "Failed to get post stats" });
  }
};
