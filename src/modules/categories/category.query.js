import Category from "./category.model.js";

export const categoryQuery = {
  create(data) {
    return Category.create(data);
  },

  find(filters = {}, options = {}) {
    const { offset = 0, limit = 50, sort = { createdAt: -1 } } = options;

    return Category.find(filters).sort(sort).skip(offset).limit(limit);
  },

  findOne(filters = {}) {
    return Category.findOne(filters);
  },

  findById(id) {
    return Category.findById(id);
  },

  updateById(id, data) {
    return Category.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  },

  softDeleteById(id) {
    return Category.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  },
};
