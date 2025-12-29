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
import accountRoutes from "./modules/accounts/account.routes.js";

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
router.use("/accounts", accountRoutes);

export default router;
