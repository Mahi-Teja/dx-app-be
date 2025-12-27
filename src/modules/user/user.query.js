import User from "./user.model.js";

export const userQuery = {
  /**
   * ---------------------------------------------------
   * Create user
   * ---------------------------------------------------
   */
  create(data) {
    return User.create(data);
  },

  /**
   * ---------------------------------------------------
   * Find many users (admin / internal use)
   * ---------------------------------------------------
   */
  find(filters = {}, options = {}) {
    const {
      offset = 0,
      limit = 50,
      sort = { createdAt: -1 },
      projection = "-password",
    } = options;

    return User.find(filters, projection).sort(sort).skip(offset).limit(limit);
  },

  /**
   * ---------------------------------------------------
   * Find user by ID
   * ---------------------------------------------------
   */
  findById(userId, projection = "-password") {
    return User.findById(userId, projection);
  },

  /**
   * ---------------------------------------------------
   * Find one user by filter
   * (used for auth, uniqueness checks)
   * ---------------------------------------------------
   */
  findOne(filters = {}, projection = "-password") {
    return User.findOne(filters, projection);
  },

  /**
   * ---------------------------------------------------
   * Update user by ID
   * ---------------------------------------------------
   */
  updateById(userId, data) {
    return User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    });
  },

  softDeleteById(id) {
    return User.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
  },

  /**
   * ---------------------------------------------------
   * Hard delete (rarely used)
   * ---------------------------------------------------
   */
  deleteById(userId) {
    return User.findByIdAndDelete(userId);
  },
};
