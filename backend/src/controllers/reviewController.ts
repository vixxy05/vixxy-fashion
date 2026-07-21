
import { Request, Response } from "express";
import db from "../models";
import { emitToAll } from "../socket/socketServer";
import { Op } from "sequelize";

const APPROVED_STATUS = "approved";

const PURCHASED_ORDER_STATUSES = ["paid", "processing", "shipping", "completed"];

const getPurchasedReviewState = async (productId: number, userId?: number) => {
  if (!userId) {
    return {
      canReview: false,
      hasPurchased: false,
      hasReviewed: false,
      userReview: null,
    };
  }

  const hasPurchased = await db.OrderDetail.findOne({
    include: [
      {
        model: db.Order,
        as: "order",
        where: {
          userId,
          orderStatus: {
            [Op.in]: PURCHASED_ORDER_STATUSES,
          },
        },
      },
    ],
    where: { productId },
  });

  const userReview = await db.Review.findOne({
    where: { productId, userId },
    include: [{ model: db.User, as: "user", attributes: ["id", "fullName", "avatar", "email"] }],
    order: [["createdAt", "DESC"]],
  });

  return {
    canReview: Boolean(hasPurchased) && !userReview,
    hasPurchased: Boolean(hasPurchased),
    hasReviewed: Boolean(userReview),
    userReview,
  };
};

// Get review by id
export const getReviewById = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const reviewId = Number(idParam);
    const review = await db.Review.findByPk(reviewId, {
      include: [
        { model: db.User, as: "user", attributes: ["id", "fullName", "avatar", "email"] },
        { model: db.Product, as: "product" },
      ],
    });
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    res.json({ success: true, data: review });
  } catch (error) {
    console.error("Get review by id error:", error);
    res.status(500).json({ success: false, message: "Failed to get review" });
  }
};

// Get reviews by product
export const getReviewsByProduct = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const productId = Number(idParam);
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    // Sorting
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) || "DESC";
    
    // Filtering
    const where: any = { productId, status: APPROVED_STATUS };
    
    if (req.query.rating) {
      where.rating = Number(req.query.rating);
    }
    
    if (req.query.hasImages === "true") {
      where.images = { [Op.ne]: null, [Op.not]: [] };
    }
    
    const { count, rows } = await db.Review.findAndCountAll({
      where,
      include: [
        { model: db.User, as: "user", attributes: ["id", "fullName", "avatar", "email"] },
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    const allApprovedReviews = await db.Review.findAll({
      where: { productId, status: APPROVED_STATUS },
      attributes: ["rating"],
    });

    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;
    const ratingTotal = allApprovedReviews.reduce((sum: number, review: { rating: number }) => {
      ratingCounts[review.rating] = (ratingCounts[review.rating] || 0) + 1;
      return sum + review.rating;
    }, 0);

    const permissions = await getPurchasedReviewState(productId, userId);
    
    res.json({
      success: true,
      data: rows,
      stats: {
        averageRating: count > 0 ? Number((ratingTotal / count).toFixed(1)) : 0,
        totalReviews: count,
        ratingCounts,
      },
      permissions: {
        canReview: permissions.canReview,
        hasPurchased: permissions.hasPurchased,
        hasReviewed: permissions.hasReviewed,
      },
      userReview: permissions.userReview,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get reviews by product error:", error);
    res.status(500).json({ success: false, message: "Failed to get reviews" });
  }
};

// Create review
export const createReview = async (req: Request, res: Response) => {
  try {
    const { productId, userId, rating, title, comment, images, size, color, city } = req.body;
    
    // Check if user has purchased the product
    const purchaseState = await getPurchasedReviewState(Number(productId), Number(userId));
    
    if (!purchaseState.hasPurchased) {
      return res.status(400).json({ success: false, message: "You must purchase this product to review it" });
    }
    
    // Check if user already reviewed this product
    const existingReview = await db.Review.findOne({ where: { productId, userId } });
    if (existingReview) {
      return res.status(400).json({ success: false, message: "You have already reviewed this product" });
    }
    
    const review = await db.Review.create({
      productId,
      userId,
      rating,
      title,
      comment,
      images,
      size,
      color,
      city,
      hasPurchased: true,
      status: "approved",
    });
    
    // Fetch the review with user data
    const reviewWithUser = await db.Review.findByPk(review.id, {
      include: [{ model: db.User, as: "user", attributes: ["id", "fullName", "avatar", "email"] }],
    });
    
    emitToAll("review:created", reviewWithUser);
    res.status(201).json({ success: true, data: reviewWithUser });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ success: false, message: "Failed to create review" });
  }
};

// Update review
export const updateReview = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const reviewId = Number(idParam);
    const review = await db.Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    await review.update(req.body);
    
    const updatedReview = await db.Review.findByPk(reviewId, {
      include: [{ model: db.User, as: "user", attributes: ["id", "fullName", "avatar", "email"] }],
    });
    
    emitToAll("review:updated", updatedReview);
    res.json({ success: true, data: updatedReview });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({ success: false, message: "Failed to update review" });
  }
};

// Like review
export const likeReview = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const reviewId = Number(idParam);
    const review = await db.Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    const newLikesCount = (review.likesCount || 0) + 1;
    await review.update({ likesCount: newLikesCount });
    const updatedReview = await db.Review.findByPk(reviewId, {
      include: [{ model: db.User, as: "user", attributes: ["id", "fullName", "avatar", "email"] }],
    });
    emitToAll("review:updated", updatedReview);
    res.json({ success: true, data: updatedReview });
  } catch (error) {
    console.error("Like review error:", error);
    res.status(500).json({ success: false, message: "Failed to like review" });
  }
};

// Reply to review (admin)
export const replyToReview = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const reviewId = Number(idParam);
    const { reply } = req.body;
    const review = await db.Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    await review.update({ reply, repliedAt: new Date() });
    const updatedReview = await db.Review.findByPk(reviewId, {
      include: [
        { model: db.User, as: "user", attributes: ["id", "fullName", "avatar", "email"] },
        { model: db.Product, as: "product" },
      ],
    });
    emitToAll("review:updated", updatedReview);
    res.json({ success: true, data: updatedReview });
  } catch (error) {
    console.error("Reply to review error:", error);
    res.status(500).json({ success: false, message: "Failed to reply to review" });
  }
};

// Delete review
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const reviewId = Number(idParam);
    const review = await db.Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    const reviewPayload = { id: review.id, productId: review.productId };
    await review.destroy();
    emitToAll("review:deleted", reviewPayload);
    res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ success: false, message: "Failed to delete review" });
  }
};

// Get all reviews (admin)
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await db.Review.findAll({
      include: [
        { model: db.User, as: "user", attributes: ["id", "fullName", "avatar", "email"] },
        { model: db.Product, as: "product" },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error("Get all reviews error:", error);
    res.status(500).json({ success: false, message: "Failed to get reviews" });
  }
};

// Update review status (admin)
export const updateReviewStatus = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const reviewId = Number(idParam);
    const { status } = req.body;
    
    const review = await db.Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    
    await review.update({ status });
    
    const updatedReview = await db.Review.findByPk(reviewId, {
      include: [
        { model: db.User, as: "user", attributes: ["id", "fullName", "avatar", "email"] },
        { model: db.Product, as: "product" },
      ],
    });
    
    emitToAll("review:updated", updatedReview);
    res.json({ success: true, data: updatedReview });
  } catch (error) {
    console.error("Update review status error:", error);
    res.status(500).json({ success: false, message: "Failed to update review status" });
  }
};
