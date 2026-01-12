import mongoose from "mongoose";
import env from "../config/env";

let cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

export default async function connectDB() {
  const uri = env.DB.MONGO_URI;

  if (!uri) throw new Error("MONGO_URI missing");

  if (cached.conn) {
    console.log("Using cached Mongo connection");
    return cached.conn;
  }

  cached.promise = mongoose.connect(uri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
  });

  cached.conn = await cached.promise;
  console.log("MongoDB connected successfully");

  return cached.conn;
}
