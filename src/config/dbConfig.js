import { Pool } from "pg";

if (process.env.NODE_ENV !== "production") {
  process.loadEnvFile(".env");
}

export const pgRailwayDB = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pgRailwayDB.on("connect", () => {
  console.log("Conectado a la base de de datos");
});

pgRailwayDB.on("error", () => {
  console.log("Algo pasó...")
})