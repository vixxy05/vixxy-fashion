
import { Router } from "express";
import CartController from "../controllers/CartController";

const router = Router();

router.get("/", CartController.getCart);
router.post("/items", CartController.addItem);
router.put("/items/:id", CartController.updateItem);
router.delete("/items/:id", CartController.removeItem);

export default router;
