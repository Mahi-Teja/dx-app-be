import Transaction from "./transaction.model.js";

export const transactionQuery = {
  /**
   * Create
   * NOTE: Always returns ARRAY (mongoose quirk)
   */
  create(data, { session } = {}) {
    return Transaction.create(Array.isArray(data) ? data : [data], { session });
  },

  /**
   * Find with pagination
   */
  async find(filters = {}, options = {}) {
    const limit = Math.min(Number(options.limit) || 20, 100);
    const offset = Math.max(0, Number(options.offset) || 0);

    const [transactions, total] = await Promise.all([
      Transaction.find(filters).sort({ occurredAt: -1, _id: -1 }).skip(offset).limit(limit).lean(),
      Transaction.countDocuments(filters),
    ]);

    return {
      transactions,
      pagination: { total, limit, offset },
    };
  },

  /**
   * Find one
   */
  findOne(filters = {}, { session } = {}) {
    return Transaction.findOne(filters).session(session);
  },

  /**
   * Find many (no pagination)
   */
  findMany(filters, { session } = {}) {
    return Transaction.find(filters).session(session);
  },
  /**
   * Find many For Analytics
   */
  findManyAnalytics(filters) {
    return (
      Transaction.find(filters)
        // .sort({ occurredAt: -1, _id: -1 })
        .populate({
          path: "categoryId",
          select: "name type",
        })
        .populate({
          path: "accountId",
          select: "name balance",
        })
    );
  },

  /**
   * Update by id
   */
  updateById(id, data, { session } = {}) {
    return Transaction.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true, session }
    );
  },

  /**
   * Soft delete one
   */
  softDeleteById(id, { session } = {}) {
    return Transaction.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true, session }
    );
  },

  /**
   * Soft delete many
   */
  softDeleteMany(filters, { session } = {}) {
    return Transaction.updateMany(
      filters,
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { session }
    );
  },

  /**
   * Update many
   */
  updateMany(filters, data, { session } = {}) {
    return Transaction.updateMany(
      filters,
      { $set: { ...data, updatedAt: new Date() } },
      { session, runValidators: true }
    );
  },

  /**
   * Find opening balance checkpoint txn
   */
  findOpeningBalanceTxn({ userId, accountId }, { session } = {}) {
    return Transaction.findOne(
      {
        userId,
        accountId,
        type: "opening_balance",
        isDeleted: false,
      },
      null,
      { session }
    );
  },
};
