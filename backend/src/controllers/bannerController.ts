
import { Request, Response } from "express";
import db from "../models";
import { emitToAll } from "../socket/socketServer";

export const getActiveBanners = async (req: Request, res: Response) => {
  try {
    const banners = await db.Banner.findAll({
      where: { isActive: true },
      order: [["displayOrder", "ASC"]],
    });
    res.json({ success: true, data: banners });
  } catch (error) {
    console.error("Get banners error:", error);
    res.status(500).json({ success: false, message: "Failed to get banners" });
  }
};

export const getAllBanners = async (req: Request, res: Response) => {
  try {
    const banners = await db.Banner.findAll({
      order: [["displayOrder", "ASC"]],
    });
    res.json({ success: true, data: banners });
  } catch (error) {
    console.error("Get all banners error:", error);
    res.status(500).json({ success: false, message: "Failed to get banners" });
  }
};

export const createBanner = async (req: Request, res: Response) => {
  try {
    const banner = await db.Banner.create(req.body);
    emitToAll("banner:updated");
    res.json({ success: true, data: banner });
  } catch (error) {
    console.error("Create banner error:", error);
    res.status(500).json({ success: false, message: "Failed to create banner" });
  }
};

export const updateBanner = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const bannerId = Number(idParam);
    const banner = await db.Banner.findByPk(bannerId);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }
    await banner.update(req.body);
    emitToAll("banner:updated");
    res.json({ success: true, data: banner });
  } catch (error) {
    console.error("Update banner error:", error);
    res.status(500).json({ success: false, message: "Failed to update banner" });
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const bannerId = Number(idParam);
    const banner = await db.Banner.findByPk(bannerId);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }
    await banner.destroy();
    emitToAll("banner:updated");
    res.json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Delete banner error:", error);
    res.status(500).json({ success: false, message: "Failed to delete banner" });
  }
};
