import { ERROR_CODES } from "../../constants/errorCodes.js";
import AppError from "../../helpers/AppError.js";
import { ApiResponse } from "../../helpers/AppResponse.js";
import * as categoryService from "./category.service.js";

// TODO " test Api routes"

/**
 * POST /categories
 */
export const create = async (req, res) => {
  const category = await categoryService.create({
    userId: req.user.id,
    ...req.body,
  });

  res.status(201).json(
    new ApiResponse({
      data: category,
      message: "Category created successfully",
    })
  );
};

/**
 * GET /categories
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
 * GET /categories
 */
export const getById = async (req, res) => {
  const categories = await categoryService.getById({
    userId: req.user.id,
    categoryId: req.params.id,
  });
  if (!categories)
    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        data: categories,
        message: "No Results",
      })
    );
  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      data: categories,
      message: "Fetched Category succesfully",
    })
  );
};

/**
 * PUT /categories/:id
 */
export const update = async (req, res) => {
  const { emoji, type, name, group } = req.body;

  // intent check (controller-level)
  if (emoji === undefined && type === undefined && name === undefined && group === undefined) {
    throw new AppError(ERROR_CODES.NOTHING_TO_PERFORM, "Nothing to update", 400);
  }

  // build update payload safely
  const updateData = {};

  if (emoji !== undefined || emoji !== "") updateData.emoji = emoji;
  if (type !== undefined) updateData.type = type;
  if (name !== undefined) updateData.name = name;
  if (group !== undefined) updateData.group = group;

  const category = await categoryService.update({
    userId: req.user.id,
    categoryId: req.params.id,
    data: updateData,
  });

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      data: category,
      message: "Category updated successfully",
    })
  );
};

/**
 * DELETE /categories/:id
 */
export const remove = async (req, res) => {
  await categoryService.remove({
    userId: req.user.id,
    categoryId: req.params.id,
  });

  res.status(200).json(
    new ApiResponse({
      message: "Category deleted successfully",
    })
  );
};
