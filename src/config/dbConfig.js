import { Pool, neonConfig } from "@neondatabase/serverless";
import path from "path";
import ws from "ws";

if (process.env.NODE_ENV !== "production") {
  process.loadEnvFile(path.join(process.cwd(), "/.env"));
}

neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true; // Mejor rendimiento en entornos serverless

export const neonDB = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  min: 2,                          // Mantiene conexiones calientes
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,   // Más tolerante a cold starts
  allowExitOnIdle: true            // Permite que el proceso cierre limpiamente
});

// Manejo de errores del pool
neonDB.on("error", (err) => {
  console.error("Unexpected DB pool error:", err);
});