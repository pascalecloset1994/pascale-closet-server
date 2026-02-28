import { Pool } from "@neondatabase/serverless";
import path from "path";

if (process.env.NODE_ENV !== "production") {
  process.loadEnvFile(path.join(process.cwd(), "/.env"));
}

export const neonDB = new Pool(process.env.DATABASE_URL);
