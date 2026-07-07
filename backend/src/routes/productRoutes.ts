import express from "express";
import db from "../models";
import { Op } from "sequelize";

const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    
    let where: any = { isActive: true };
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    let order: any = [["createdAt", "DESC"]];
    if (sort === "price-asc") {
      order = [["price", "ASC"]];
    } else if (sort === "price-desc") {
      order = [["price", "DESC"]];
    }

    const products = await db.Product.findAll({ where, order });
    res.json({ success: true, data: products });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ success: false, message: "Failed to get products" });
  }
});

// Get product by id
router.get("/:id", async (req, res) => {
  try {
    const product = await db.Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ success: false, message: "Failed to get product" });
  }
});

export default router;
