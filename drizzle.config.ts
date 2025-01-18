import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

const envFile =
  process.env.NODE_ENV === "production" ? "./.env.prod" : "./.env.local";

dotenv.config({
  path: envFile,
});

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("Missing required environment variables");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/config/db/schema.js",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
