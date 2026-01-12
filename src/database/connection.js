import mongoose from "mongoose";

let cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

export default async function connectDB() {
  const uri = process.env.MONGO_URI;

  console.log("MONGO_URI =", uri); // TEMP DEBUG

  if (!uri) {
    throw new Error("MONGO_URI is missing from environment variables");
  }

  if (cached.conn) {
    console.log("Using cached MongoDB connection");
    return cached.conn;
  }

  try {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });

    cached.conn = await cached.promise;
    console.log("MongoDB connected successfully");
    return cached.conn;
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    throw err;
  }
}
