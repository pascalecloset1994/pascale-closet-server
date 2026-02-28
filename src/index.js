import express from "express";
import cookieParser from "cookie-parser";
import { createAppRouter } from "./routes/index.js";
import { corsMiddleware } from "./middlewares/cors.js";
import rateLimit from "express-rate-limit";

 const app = express();

  const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 300,
    message: "Demasiadas peticiones desde esa IP. Reintente más tarde..",
  });

  app.use(limiter);
  app.use(corsMiddleware());
  app.use(cookieParser());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: false, limit: "10mb" }));
  app.disable("x-powered-by");
  app.use("/api", createAppRouter({ db }));

  export default app;
