import Account from "./account.model.js";

export const accountQuery = {
  create(data) {
    return Account.create(data);
  },

  find(filters = {}, options = {}) {
    const { offset = 0, limit = 50, sort = { createdAt: -1 } } = options;

    return Account.find(filters).sort(sort).skip(offset).limit(limit);
  },

  findOne(filters = {}) {
    return Account.findOne(filters);
  },

  findById(id) {
    return Account.findById(id);
  },

  updateById(id, data) {
    return Account.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  },

  softDeleteById(id) {
    return Account.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  },
  updateBalance(accountId, delta) {
    return Account.updateOne({ _id: accountId }, { $inc: { balance: delta } });
  },
};
