import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../helpers/asynchandler.js";

import * as controller from "./fns.controller.js";

const router = Router();

router.use(authMiddleware("both"));

router.get("/dashboard/get", asyncHandler(controller.dashboardData));
export default router;
