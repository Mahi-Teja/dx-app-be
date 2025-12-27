import { Router } from "express";
import * as controller from "./user.controller.js";
import { asyncHandler } from "../../helpers/asynchandler.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const router = Router();
console.log("l");

router.use(authMiddleware("both"));
router.post("/create", asyncHandler(controller.create));
router.get("/get/:id", asyncHandler(controller.getById));
router.get("/get/", asyncHandler(controller.getById));
router.put("/update/:id", asyncHandler(controller.update));
router.put("/update-password/", asyncHandler(controller.updatePassword));
router.delete("/delete/:id", asyncHandler(controller.remove));

export default router;
