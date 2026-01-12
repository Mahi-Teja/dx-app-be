import mongoose from "mongoose";
import env from "../config/env";

let cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

export default async function connectDB() {
  console.log("CONNECTING TO MONGO...");
  if (!env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }

  if (cached.conn) {
    console.log("Using cached Mongo connection");
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(env.MONGO_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  console.log("MongoDB connected successfully");

  return cached.conn;
}
