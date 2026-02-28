import { Router } from "express";
import { createProductsRouter } from "./product.routes.js";
import { createAuthRouter } from "./auth.routes.js";
import { createUserRouter } from "./user.routes.js";
import { createPaymentRouter } from "./payment.routes.js";
import { createOrderRouter } from "./order.routes.js";

export const createAppRouter = ({ db }) => {
  const appRouter = Router();

  appRouter.use("/user", createAuthRouter({ db }));
  appRouter.use("/user", createUserRouter({ db }));
  appRouter.use(createProductsRouter({ db }));
  appRouter.use(createOrderRouter({ db }));
  appRouter.use("/payment", createPaymentRouter({ db }));
  
  return appRouter;
};
