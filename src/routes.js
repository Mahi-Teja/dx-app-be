import { Router } from "express";

/**
 * Public modules
 */
import authRoutes from "./modules/auth/auth.routes.js";

/**
 * Protected modules
 */
import userRoutes from "./modules/user/user.routes.js";
import categoryRoutes from "./modules/categories/category.routes.js";

const router = Router();

/**
 * ---------------------------------------------------
 * Public routes (no auth)
 * ---------------------------------------------------
 */
router.use("/auth", authRoutes);

/**
 * ---------------------------------------------------
 * Protected routes (auth applied inside modules)
 * ---------------------------------------------------
 */
router.use("/user", userRoutes);
router.use("/categories", categoryRoutes);

export default router;
