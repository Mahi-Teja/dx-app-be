import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../helpers/asynchandler.js";

import * as controller from "./fns.controller.js";
import { analyticsData } from "../analytics/controller.js";

const router = Router();

router.use(authMiddleware("both"));

router.get("/dashboard/get", asyncHandler(controller.dashboardData));
router.get("/analytics/get", asyncHandler(analyticsData));
export default router;
