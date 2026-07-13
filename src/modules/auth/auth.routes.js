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
router.post("/google/sign", asyncHandler(controller.googleAuth));
router.post("/logout", asyncHandler(controller.logout));
router.post("/forgot-password", asyncHandler(controller.forgotPassword));
router.get("/verify-reset-password/:token", asyncHandler(controller.verifyResetPassword));
router.patch("/reset-password/:token", asyncHandler(controller.resetPassword));
export default router;
