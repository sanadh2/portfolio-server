const { drizzle: neonDrizzle } = require("drizzle-orm/neon-http");
const { neon } = require("@neondatabase/serverless");
const { drizzle: postgreDrizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const dotenv = require("dotenv");
const schema = require("./schema");

const envFile =
  process.env.NODE_ENV === "PRODUCTION" ? "./.env.prod" : "./.env.local";

dotenv.config({
  path: envFile,
});

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("Missing required environment variables");
}

const dbCred = () => {
  if (process.env.NODE_ENV === "PRODUCTION") {
    const sql = neon(DATABASE_URL);
    return neonDrizzle({
      client: sql,
      schema,
    });
  } else {
    const client = postgres(DATABASE_URL);
    return postgreDrizzle({
      client,
      schema,
    });
  }
};
module.exports = { db: dbCred() };
