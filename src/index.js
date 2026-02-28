import { createApp } from "./app.js";
import { pgRailwayDB } from "./config/dbConfig.js";

const app = createApp({ db: pgRailwayDB });

export default app;