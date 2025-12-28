import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      //   index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    /**
     * Analytics grouping
     */
    group: {
      type: String,
      trim: true,
      lowercase: true,
      default: "ungrouped",
    },

    type: {
      type: String,
      enum: ["expense", "income", "self"],
      required: true,
    },

    emoji: {
      type: String,
      default: "🗂️",
    },

    isDeleted: {
      type: Boolean,
      default: false,
      //   index: true,
    },
  },
  { timestamps: true }
);

/**
 * ✅ Correct uniqueness:
 * Prevent duplicate active categories per user + name + type
 */
CategorySchema.index({ userId: 1, name: 1, type: 1, isDeleted: 1 }, { unique: true });

export default mongoose.model("Category", CategorySchema);
