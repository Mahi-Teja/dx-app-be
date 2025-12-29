import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import * as controller from "./transaction.controller.js";
import { asyncHandler } from "../../helpers/asynchandler.js";

const router = Router();

/**
 * Apply auth once per module
 */
router.use(authMiddleware("both"));

router.post("/create", asyncHandler(controller.create));
router.get("/getList/", asyncHandler(controller.list));
router.get("/get/:id", asyncHandler(controller.getById));
router.put("/update/:id", asyncHandler(controller.updateOne));
router.delete("/delete/:id", asyncHandler(controller.deleteOne));

export default router;
