import { Router } from "express";
import { createProductsRouter } from "./product.routes.js";
import { createAuthRouter } from "./auth.routes.js";
import { createUserRouter } from "./user.routes.js";
import { createPaymentRouter } from "./payment.routes.js";
import { createOrderRouter } from "./order.routes.js";
import { CohereController } from "../controllers/cohere.controller.js";

export const createAppRouter = ({ db }) => {
  const appRouter = Router();
  const cohereController = new CohereController();

  appRouter.use("/user", createAuthRouter({ db }));
  appRouter.use("/user", createUserRouter({ db }));
  appRouter.use(createProductsRouter({ db }));
  appRouter.use(createOrderRouter({ db }));
  appRouter.use("/payment", createPaymentRouter({ db }));

  // IA assistant
  appRouter.get("/ai-assistant", cohereController.initChat);
  
  return appRouter;
};
