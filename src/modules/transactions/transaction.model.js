import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * expense | income | transfer | opening_balance | adjustment
     */
    type: {
      type: String,
      enum: ["expense", "income", "transfer", "opening_balance", "adjustment"],
      required: true,
      immutable: true,
    },

    /**
     * debit = money leaves this account
     * credit = money enters this account
     */
    direction: {
      type: String,
      enum: ["debit", "credit"],
      required: true,
      immutable: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
      immutable: true,
    },

    description: { type: String, trim: true },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    /**
     * Source account
     */
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },

    /**
     * Destination account (transfer only)
     */
    toAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: function () {
        return this.type === "transfer";
      },
    },

    note: { type: String, trim: true },

    occurredAt: {
      type: Date,
      required: true,
      index: true,
    },

    timezone: {
      type: String,
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    /**
     * Offline sync / idempotency
     */
    clientTxnId: {
      type: String,
    },
  },
  { timestamps: true }
);

/**
 * Indexes
 */
TransactionSchema.index({ userId: 1, isDeleted: 1, occurredAt: -1 });
TransactionSchema.index({ userId: 1, accountId: 1, isDeleted: 1, occurredAt: -1 });
TransactionSchema.index({ userId: 1, categoryId: 1, isDeleted: 1, occurredAt: -1 });

TransactionSchema.index(
  { userId: 1, clientTxnId: 1 },
  {
    unique: true,
    partialFilterExpression: { clientTxnId: { $type: "string" } },
  }
);

export default mongoose.model("Transaction", TransactionSchema);
