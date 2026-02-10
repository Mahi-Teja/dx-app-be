import AppError from "../../helpers/AppError.js";
import { ApiResponse } from "../../helpers/AppResponse.js";
import * as fnService from "./fns.service.js";

const dashboardData = async (req, res) => {
  const { startDate, endDate, accountId } = req.query;

  // 1. Basic Validation
  if (!startDate) {
    throw new AppError(400, "Start date is required");
  }

  const dashboard = await fnService.getDashboard({
    userId: req.user.id,
    startDate,
    endDate, // If null, service handles as single day
    accountId,
  });

  res
    .status(200)
    .json(new ApiResponse({ statusCode: 200, data: dashboard, message: "Dashboard data fetched" }));
};

export { dashboardData };

/**
 * RESPONSE: 
{
  "meta": {
    "range": {
      "from": "2026-01-06",
      "to": "2026-01-06"
    },
    "currency": "INR",
    "generatedAt": "2026-01-06T09:30:00Z",
    "etag": "dashboard_20260106_v3"
  },

  "summary": {
    "income": 12000,
    "expense": 8500,
    "balance": 3500
  },

  "activity": {
    "today": {
      "count": 4,
      "transactions": [
        {
          "id": "txn_1",
          "type": "expense",
          "amount": 250,
          "category": "Food",
          "account": "Cash",
          "occurredAt": "2026-01-06T08:45:00Z"
        }
      ]
    }
  }
}

 * 
 */
