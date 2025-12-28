import { ERROR_CODES } from "../../constants/errorCodes.js";
import AppError from "../../helpers/AppError.js";
import { categoryQuery } from "./category.query.js";

/**
 * ---------------------------------------------------
 * Create Category
 * ---------------------------------------------------
 */
export async function create({ userId, name, type, emoji }) {
  if (!name || !type) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "Category name and type are required", 400);
  }

  const existing = await categoryQuery.findOne({
    userId,
    name,
    type,
    isDeleted: false,
  });

  if (existing) {
    throw new AppError(ERROR_CODES.CATEGORY_ALREADY_EXISTS, "Category already exists", 409);
  }

  return categoryQuery.create({
    userId,
    name,
    type,
    emoji,
  });
}

/**
 * ---------------------------------------------------
 * List Categories
 * ---------------------------------------------------
 */
export async function list({ userId, query }) {
  const { type, limit = 50, offset = 0 } = query;

  const filter = {
    userId,
    isDeleted: false,
  };

  if (type) filter.type = type;

  return categoryQuery.find(filter, {
    limit: Number(limit),
    offset: Number(offset),
  });
}

export async function getById({ userId, categoryId }) {
  const filter = {
    _id: categoryId,
    userId,
    isDeleted: false,
  };

  return categoryQuery.findOne(filter);
}

/**
 * ---------------------------------------------------
 * Update Category
 * ---------------------------------------------------
 */
export async function update({ userId, categoryId, data }) {
  const category = await categoryQuery.findOne({
    _id: categoryId,
    userId,
    isDeleted: false,
  });

  if (!category) {
    throw new AppError(ERROR_CODES.CATEGORY_NOT_FOUND, "Category not found", 404);
  }
  // 🚫 Reject empty strings explicitly
  if ("name" in data && data.name === "") {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "Category name cannot be empty", 400);
  }

  if ("type" in data && data.type === "") {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "Category type cannot be empty", 400);
  }

  if ("emoji" in data && data.emoji === "") {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "Category emoji cannot be empty", 400);
  }
  return categoryQuery.updateById(categoryId, data);
}

/**
 * ---------------------------------------------------
 * Delete Category (Soft)
 * ---------------------------------------------------
 */
export async function remove({ userId, categoryId }) {
  const category = await categoryQuery.findOne({
    _id: categoryId,
    userId,
    isDeleted: false,
  });

  if (!category) {
    throw new AppError(ERROR_CODES.CATEGORY_NOT_FOUND, "Category not found", 404);
  }

  await categoryQuery.softDeleteById(categoryId);
}
