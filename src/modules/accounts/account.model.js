import mongoose from "mongoose";
import { ACCOUNT_LABELS } from "../../constants/accountTypes.js";

const AccountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },

    name: { type: String, required: true, trim: true },

    type: {
      type: String,
      enum: ACCOUNT_LABELS,
      required: true,
    },

    icon: { type: String, default: "💰" },

    /**
     * Cached balance (derived from transactions)
     * NEVER trust this blindly.
     */
    balance: {
      type: Number,
      default: 0,
    },

    /**
     * Credit card metadata only
     */
    creditLimit: { type: Number },
    billingDay: { type: Number, min: 1, max: 31 },
    dueInDays: { type: Number, min: 0 },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/**
 * Prevent duplicate active accounts per user + name + type
 */
// Listing & access
AccountSchema.index({ userId: 1, isDeleted: 1 });

// Uniqueness constraint
AccountSchema.index({ userId: 1, name: 1, type: 1, isDeleted: 1 }, { unique: true });

export default mongoose.model("Account", AccountSchema);
