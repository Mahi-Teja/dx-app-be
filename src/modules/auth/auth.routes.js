import { Router } from "express";
import * as controller from "./auth.controller.js";

const router = Router();

/**
 * ---------------------------------------------------
 * Auth routes
 * ---------------------------------------------------
 */
router.post("/register", asyncHandle(controller.register));
router.post("/login", asyncHandler(controller.login));

export default router;
