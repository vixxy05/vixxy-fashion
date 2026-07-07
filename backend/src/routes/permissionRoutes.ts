
import express from "express";
import {
  getAllPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  assignPermissionToRole,
  removePermissionFromRole,
  getRolePermissions
} from "../controllers/permission.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

const router = express.Router();

// All routes require authentication and super admin role
router.use(requireAuth);
router.use(requireRole("SUPER_ADMIN"));

// Permission CRUD
router.get("/", getAllPermissions);
router.get("/:id", getPermissionById);
router.post("/", createPermission);
router.put("/:id", updatePermission);
router.delete("/:id", deletePermission);

// Role permission assignment
router.post("/assign", assignPermissionToRole);
router.post("/remove", removePermissionFromRole);
router.get("/role/:roleId", getRolePermissions);

export default router;
