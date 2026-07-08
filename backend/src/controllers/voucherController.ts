
import { Request, Response } from "express";
import db from "../models";
import { Op } from "sequelize";

export const validateVoucher = async (req: Request, res: Response) => {
  try {
    const { code, orderAmount } = req.body;
    const voucher = await db.Voucher.findOne({ where: { code } });

    if (!voucher) {
      return res.status(404).json({ success: false, message: "Voucher not found" });
    }

    if (!voucher.isActive) {
      return res.status(400).json({ success: false, message: "Voucher is inactive" });
    }

    if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: "Voucher has expired" });
    }

    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({ success: false, message: "Voucher usage limit reached" });
    }

    if (voucher.minOrderAmount && Number(orderAmount) < Number(voucher.minOrderAmount)) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum order amount is ${voucher.minOrderAmount}` 
      });
    }

    let discountAmount = 0;
    if (voucher.discountType === "PERCENTAGE") {
      discountAmount = (Number(orderAmount) * Number(voucher.discountValue)) / 100;
      if (voucher.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, Number(voucher.maxDiscountAmount));
      }
    } else {
      discountAmount = Number(voucher.discountValue);
    }

    res.json({ success: true, data: { voucher, discountAmount } });
  } catch (error) {
    console.error("Validate voucher error:", error);
    res.status(500).json({ success: false, message: "Failed to validate voucher" });
  }
};

export const getAllVouchers = async (req: Request, res: Response) => {
  try {
    const vouchers = await db.Voucher.findAll({ order: [["createdAt", "DESC"]] });
    res.json({ success: true, data: vouchers });
  } catch (error) {
    console.error("Get vouchers error:", error);
    res.status(500).json({ success: false, message: "Failed to get vouchers" });
  }
};

export const createVoucher = async (req: Request, res: Response) => {
  try {
    const voucher = await db.Voucher.create(req.body);
    res.json({ success: true, data: voucher });
  } catch (error) {
    console.error("Create voucher error:", error);
    res.status(500).json({ success: false, message: "Failed to create voucher" });
  }
};

export const updateVoucher = async (req: Request, res: Response) => {
  try {
    const voucher = await db.Voucher.findByPk(req.params.id as string);
    if (!voucher) {
      return res.status(404).json({ success: false, message: "Voucher not found" });
    }
    await voucher.update(req.body);
    res.json({ success: true, data: voucher });
  } catch (error) {
    console.error("Update voucher error:", error);
    res.status(500).json({ success: false, message: "Failed to update voucher" });
  }
};

export const deleteVoucher = async (req: Request, res: Response) => {
  try {
    const voucher = await db.Voucher.findByPk(req.params.id as string);
    if (!voucher) {
      return res.status(404).json({ success: false, message: "Voucher not found" });
    }
    await voucher.destroy();
    res.json({ success: true, message: "Voucher deleted successfully" });
  } catch (error) {
    console.error("Delete voucher error:", error);
    res.status(500).json({ success: false, message: "Failed to delete voucher" });
  }
};
