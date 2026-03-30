import express from "express";
import cookieParser from "cookie-parser";
import { createAppRouter } from "./routes/index.js";
import { corsMiddleware } from "./middlewares/cors.js";
import rateLimit from "express-rate-limit";
import { neonDB } from "./config/dbConfig.js";

const app = express();
app.set("trust proxy", 1);

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 500,
    message: "Demasiadas peticiones desde esa IP. Reintente más tarde..",
});

app.use(limiter);
app.use(corsMiddleware());
app.use(cookieParser());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: false, limit: "25mb" }));
app.disable("x-powered-by");
app.use(createAppRouter({ db: neonDB }));

app.listen(3000, () => console.log("http://localhost:3000"))

export default app;
