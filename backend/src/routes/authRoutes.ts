import express from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  logoutAllDevices,
  getActiveTokens,
} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

// Protected routes
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, (req, res, next) => getProfile(req, res, next));
router.get("/profile", requireAuth, getProfile);
router.put("/profile", requireAuth, updateProfile);
router.post("/logout-all", requireAuth, logoutAllDevices);
router.get("/active-tokens", requireAuth, getActiveTokens);

export default router;
