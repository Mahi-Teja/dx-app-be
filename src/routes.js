import { Router } from "express";

/**
 * Public modules
 */
// import {authRoutes} from "./modules/auth/auth.routes.js";

/**
 * Protected modules
 */
import transactionRoutes from "./modules/transactions/transaction.routes.js";
// import accountRoutes from "./modules/accounts/account.routes.js";
// import categoryRoutes from "./modules/categories/category.routes.js";

const router = Router();

/**
 * ---------------------------------------------------
 * Public routes (no auth)
 * ---------------------------------------------------
 */
// router.use("/auth", authRoutes);

/**
 * ---------------------------------------------------
 * Protected routes (auth applied inside modules)
 * ---------------------------------------------------
 */
router.use("/transactions", transactionRoutes);
// router.use("/accounts", accountRoutes);
// router.use("/categories", categoryRoutes);

export default router;
