import { Router } from "express";
import { createProductsRouter } from "../modules/products/product.routes.js";
import { createAuthRouter } from "../modules/auth/auth.routes.js";
import { createUserRouter } from "../modules/users/user.routes.js";
import { createPaymentRouter } from "../modules/payments/payment.routes.js";
import { createOrderRouter } from "../modules/orders/order.routes.js";
import { createLogsRouter } from "../modules/logs/logs.routes.js";

export const createAppRouter = ({ db }) => {
   const appRouter = Router();

   appRouter.use("/auth", createAuthRouter({ db }));
   appRouter.use("/user", createUserRouter({ db }));
   appRouter.use(createProductsRouter({ db }));
   appRouter.use(createOrderRouter({ db }));
   appRouter.use("/payment", createPaymentRouter({ db }));
   appRouter.use(createLogsRouter({ db }));

   return appRouter;
};
