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
     * expense | income | transfer
     */
    type: {
      type: String,
      enum: ["expense", "income", "transfer"],
      required: true,
      immutable: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    description: {
      type: String,
      trim: true,
    },

    /**
     * Category (expense / income only)
     */
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
    },

    /**
     * Destination account (transfer only)
     */
    toAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },

    note: {
      type: String,
      trim: true,
    },

    occurredAt: {
      type: Date,
      required: true,
      index: true,
    },

    /**
     * Soft delete
     */
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    /**
     * Client-generated id for offline sync
     */
    clientTxnId: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

/**
 * ---------------------------------------------------
 * Indexes
 * ---------------------------------------------------
 */

// Idempotency for offline sync (per user)
TransactionSchema.index(
  { userId: 1, clientTxnId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      clientTxnId: { $exists: true },
    },
  }
);

TransactionSchema.index({ userId: 1, accountId: 1, occurredAt: -1 });

export default mongoose.model("Transaction", TransactionSchema);
