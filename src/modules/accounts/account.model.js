import mongoose from "mongoose";
import { ACCOUNT_LABELS } from "../../constants/accountTypes.js";

const AccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ACCOUNT_LABELS,
      required: true,
    },

    icon: {
      type: String,
      default: "💰",
    },

    /**
     * Current outstanding balance (credit cards only)
     */
    balance: {
      type: Number,
      default: 0,
    },

    /**
     * Credit limit of the account (credit cards only)
     */
    creditLimit: {
      type: Number,
    },

    /**
     * Opening balance at the time of account creation
     * (optional, mostly for imports)
     */
    openingBalance: {
      type: Number,
      default: 0,
    },
    /*
     Credit card specific fields
     */
    billingDay: {
      type: Number,
      min: 1,
      max: 31,
    },

    dueInDays: {
      type: Number,
      min: 0,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

/**
 * Prevent duplicate active accounts per user + name + type
 */
AccountSchema.index({ userId: 1, name: 1, type: 1, isDeleted: 1 }, { unique: true });

export default mongoose.model("Account", AccountSchema);
