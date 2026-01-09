import dotenv from "dotenv";
import path from "node:path";
/**
 * Load correct env file
 * - .env.local (highest priority)
 * - .env.development
 * - .env.production
 */
const NODE_ENV = process.env.NODE_ENV || "development";

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${NODE_ENV}`),
});

/**
 * Required variable helper
 */
const required = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required env variable: ${key}`);
  }
  return value;
};

const env = Object.freeze({
  NODE_ENV,

  APP: {
    NAME: "Dx Tracker API",
    PORT: Number(process.env.PORT || 4000),
    BASE_URL: process.env.BASE_URL || "http://localhost:4000",
  },

  DB: {
    MONGO_URI: required("MONGO_URI"),
  },
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,

  AUTH: {
    JWT_SECRET: required("JWT_SECRET"),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  },

  SECURITY: {
    BCRYPT_ROUNDS: Number(process.env.BCRYPT_ROUNDS || 10),
    RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX || 100),
  },

  LOGGING: {
    LEVEL: process.env.LOG_LEVEL || "info",
  },
});

export default env;
