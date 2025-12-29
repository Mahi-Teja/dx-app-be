import Transaction from "./transaction.model.js";

export const transactionQuery = {
  /**
   * ---------------------------------------------------
   * Create
   * ---------------------------------------------------
   */
  create(data) {
    return Transaction.create(data);
  },

  /**
   * ---------------------------------------------------
   * Find many (paginated)
   * ---------------------------------------------------
   */
  find(filters = {}, options = {}) {
    const { offset = 0, limit = 50, sort = { createdAt: -1 } } = options;

    return Transaction.find(filters).sort(sort).skip(offset).limit(limit);
  },

  /**
   * ---------------------------------------------------
   * Find one by filter
   * ---------------------------------------------------
   */
  findOne(filters = {}) {
    return Transaction.findOne(filters);
  },

  /**
   * ---------------------------------------------------
   * Find by ID
   * (use only when ID lookup is truly needed)
   * ---------------------------------------------------
   */
  findById(id) {
    return Transaction.findById(id);
  },

  /**
   * ---------------------------------------------------
   * Update one by ID
   * ---------------------------------------------------
   */
  updateById(id, data) {
    return Transaction.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  },

  /**
   * ---------------------------------------------------
   * Update many by filter
   * ---------------------------------------------------
   */
  updateMany(filters, data) {
    return Transaction.updateMany(filters, data, { runValidators: true });
  },

  /**
   * ---------------------------------------------------
   * Soft delete one
   * ---------------------------------------------------
   */
  softDeleteById(id) {
    return Transaction.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );
  },

  /**
   * ---------------------------------------------------
   * Soft delete many
   * ---------------------------------------------------
   */
  softDeleteMany(filters) {
    return Transaction.updateMany(filters, {
      isDeleted: true,
      deletedAt: new Date(),
    });
  },
};
