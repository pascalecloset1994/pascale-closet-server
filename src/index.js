import express from "express";
import cookieParser from "cookie-parser";
import { createAppRouter } from "./routes/index.js";
import { corsMiddleware } from "./middlewares/cors.js";
import rateLimit from "express-rate-limit";
import { neonDB } from "./config/dbConfig.js";

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
app.use(createAppRouter({ db: neonDB }));

app.get("/health", async (req, res) => {
    try {
        res.status(200).json({ message: "Se ha conctado con exito al servidor." })
    } catch (error) {
        res.status(500).json({ message: "No se ha podido conectar al servidor." })
    }
})

app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000")
})

export default app;
