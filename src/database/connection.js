import mongoose from "mongoose";
import env from "../config/env.js";

export default async function connectDB() {
  await mongoose.connect(env.DB.MONGO_URI);
  console.log("MongoDB connected");
}
