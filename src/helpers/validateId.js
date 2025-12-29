import mongoose from "mongoose";
import { ERROR_CODES } from "../constants/errorCodes.js";
import AppError from "./AppError.js";

export const validateObjectId = (id, field = "id") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(ERROR_CODES.INVALID_ID, `Invalid ${field}`, 400);
  }
  return;
};
