import { ERROR_CODES } from "../../constants/errorCodes.js";
import AppError from "../../helpers/AppError.js";
import { ApiResponse } from "../../helpers/AppResponse.js";
import * as categoryService from "./category.service.js";
import { validateObjectId } from "../../helpers/validateId.js";

/**
 * ---------------------------------------------------
 * POST /categories
 * ---------------------------------------------------
 */
export const create = async (req, res) => {
  const { type, name, emoji, group } = req.body;

  const category = await categoryService.create({
    userId: req.user.id,
    data: { type, name, emoji, group },
  });

  res.status(201).json(
    new ApiResponse({
      data: category,
      message: "Category created successfully",
    })
  );
};

/**
 * ---------------------------------------------------
 * GET /categories
 * ---------------------------------------------------
 */
export const list = async (req, res) => {
  const categories = await categoryService.list({
    userId: req.user.id,
    query: req.query,
  });

  res.status(200).json(
    new ApiResponse({
      data: categories,
    })
  );
};

/**
 * ---------------------------------------------------
 * GET /categories/:id
 * ---------------------------------------------------
 */
export const getById = async (req, res) => {
  const categoryId = req.params.id;
  validateObjectId(categoryId, "categoryId");

  const category = await categoryService.getById({
    userId: req.user.id,
    categoryId,
  });

  res.status(200).json(
    new ApiResponse({
      data: category,
      message: "Fetched category successfully",
    })
  );
};

/**
 * ---------------------------------------------------
 * PUT /categories/:id
 * ---------------------------------------------------
 */
export const update = async (req, res) => {
  const categoryId = req.params.id;
  validateObjectId(categoryId, "categoryId");

  const { emoji, name, group } = req.body;

  // intent check
  if (emoji === undefined && name === undefined && group === undefined) {
    throw new AppError(ERROR_CODES.NOTHING_TO_PERFORM, "Nothing to update", 400);
  }

  const updateData = {};
  if (emoji !== undefined) updateData.emoji = emoji;
  if (name !== undefined) updateData.name = name;
  if (group !== undefined) updateData.group = group;

  const category = await categoryService.update({
    userId: req.user.id,
    categoryId,
    data: updateData,
  });

  res.status(200).json(
    new ApiResponse({
      data: category,
      message: "Category updated successfully",
    })
  );
};

/**
 * ---------------------------------------------------
 * DELETE /categories/:id
 * ---------------------------------------------------
 */
export const remove = async (req, res) => {
  const categoryId = req.params.id;
  validateObjectId(categoryId, "categoryId");

  await categoryService.remove({
    userId: req.user.id,
    categoryId,
  });

  res.status(200).json(
    new ApiResponse({
      message: "Category deleted successfully",
    })
  );
};
