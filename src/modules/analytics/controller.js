import { ApiResponse } from "../../helpers/AppResponse.js";
import * as analyticsService from "./service.js";

export const analyticsData = async (req, res) => {
  const window = req.params.window || req.query.window || "monthly";

  const data = await analyticsService.getAnalytics({
    userId: req.user.id,
    window,
  });

  return res.json(
    new ApiResponse({
      statusCode: 200,
      data,
      message: "Analytics data fetched",
    })
  );
};
