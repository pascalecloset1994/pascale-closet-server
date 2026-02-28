import { Pool, neonConfig } from "@neondatabase/serverless";
import path from "path";
import ws from "ws"

if (process.env.NODE_ENV !== "production") {
  process.loadEnvFile(path.join(process.cwd(), "/.env"));
}

neonConfig.webSocketConstructor = ws;

export const neonDB = new Pool({
  connectionString: process.env.DATABASE_URL
});