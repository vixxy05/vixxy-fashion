
import express from "express";
import { validateVoucher, getAllVouchers, createVoucher, updateVoucher, deleteVoucher } from "../controllers/voucherController";

const router = express.Router();

// Public route
router.post("/validate", validateVoucher);

// Admin routes
router.get("/admin/all", getAllVouchers);
router.post("/admin", createVoucher);
router.put("/admin/:id", updateVoucher);
router.delete("/admin/:id", deleteVoucher);

export default router;
