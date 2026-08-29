import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // crucial for Render Postgres
  },
});

// Optional: test the connection
pool.connect()
  .then(() => console.log("Database connected ✅"))
  .catch(err => console.error("Database connection error ❌", err));
