import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../helpers/asynchandler.js";
import * as controller from "./category.controller.js";

const router = Router();

/**
 * Apply auth once per module
 */
router.use(authMiddleware("both"));

router.post("/create", asyncHandler(controller.create));
router.get("/get", asyncHandler(controller.list));
router.get("/get/:id", asyncHandler(controller.getById));
router.put("/update/:id", asyncHandler(controller.update));
router.delete("/delete/:id", asyncHandler(controller.remove));

export default router;
