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

/**
 * ---------------------------------------------------
 * Core middlewares (ORDER MATTERS)
 * ---------------------------------------------------
 */
app.use(
  cors({
    origin: env.APP.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
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
