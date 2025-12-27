import { Router } from "express";

/**
 * Public modules
 */
import authRoutes from "./modules/auth/auth.routes.js";

/**
 * Protected modules
 */

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

export default router;
