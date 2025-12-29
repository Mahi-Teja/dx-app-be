import { Router } from "express";
import * as controller from "./auth.controller.js";
import { asyncHandler } from "../../helpers/asynchandler.js";

const router = Router();

/**
 * ---------------------------------------------------
 * Auth routes
 * ---------------------------------------------------
 */
router.post("/register", asyncHandler(controller.register));
router.post("/login", asyncHandler(controller.login));
router.post("/logout", asyncHandler(controller.logout));

export default router;
