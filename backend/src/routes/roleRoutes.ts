
import express from "express";
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignRoleToUser,
  removeRoleFromUser,
  getUserRoles
} from "../controllers/role.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

const router = express.Router();

// All routes require authentication and admin/super_admin role
router.use(requireAuth);
router.use(requireRole("ADMIN", "SUPER_ADMIN"));

// Role CRUD
router.get("/", getAllRoles);
router.get("/:id", getRoleById);
router.post("/", createRole);
router.put("/:id", updateRole);
router.delete("/:id", deleteRole);

// User role assignment
router.post("/assign", assignRoleToUser);
router.post("/remove", removeRoleFromUser);
router.get("/user/:userId", getUserRoles);

export default router;
