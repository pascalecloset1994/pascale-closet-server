import { Router } from "express";
import { createProductsRouter } from "./product.routes.js";
import { createAuthRouter } from "./auth.routes.js";
import { createUserRouter } from "./user.routes.js";
import { createPaymentRouter } from "./payment.routes.js";
import { createOrderRouter } from "./order.routes.js";

export const createAppRouter = ({ db }) => {
   const appRouter = Router();

   appRouter.use("/auth", createAuthRouter({ db }));
   appRouter.use("/user", createUserRouter({ db }));
   appRouter.use(createProductsRouter({ db }));
   appRouter.use(createOrderRouter({ db }));
   appRouter.use("/payment", createPaymentRouter({ db }));
   appRouter.post("/loger", async (req, res) => {
      try {
         const { log } = req.body
         await db.query("INSERT INTO logger_pascale (message) VALUES ($1)", [log])
         res.status(200)
      } catch (error) {
         res.status(500).json({ message: "No se ha podido conectar al servidor." })
      }
   });

   return appRouter;
};
