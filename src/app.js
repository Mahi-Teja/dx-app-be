console.log("APP.JS LOADED");

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import env from "./config/env.js";
import routes from "./routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

/**
 * ---------------------------------------------------
 * Trust proxy (required for cookies in prod)
 * ---------------------------------------------------
 */
app.set("trust proxy", 1);

export const ALLOWED_ORIGINS = new Set(
  (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)
);

const corsOptions = {
  origin(origin, callback) {
    // Allow server-to-server, curl, postman, etc.
    if (!origin) return callback(null, true);

    if (ALLOWED_ORIGINS.has(origin)) {
      return callback(null, true);
    }

    console.warn("CORS blocked origin:", origin);
    return callback(null, false); // DO NOT throw
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-Timezone"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/**
 * ---------------------------------------------------
 * HTTP logging (dev only)
 * ---------------------------------------------------
 */

/**
 * ---------------------------------------------------
 * Health check (no auth, no DB)
 * ---------------------------------------------------
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

/**
 * ---------------------------------------------------
 * API routes
 * ---------------------------------------------------
 */
app.use("/api/v1", routes);
console.log("v1 routes hit");

/**
 * ---------------------------------------------------
 * 404 handler
 * ---------------------------------------------------
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
});

/**
 * ---------------------------------------------------
 * Global error handler
 * ---------------------------------------------------
 */
app.use(errorMiddleware);

export default app;
