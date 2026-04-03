import { Router } from "express";
import { PaymentController } from "./payment.controller.js";
import { OrderModel } from "../orders/order.model.js";
import { PaymentModel } from "./payment.models.js";
import { isAuth } from "../../middlewares/isAuth.js";

export const createPaymentRouter = ({ db }) => {
  const paymentRouter = Router();
  const orderModel = new OrderModel(db);
  const paymentModel = new PaymentModel(db);
  const paymentController = new PaymentController({ orderModel, paymentModel, db });

  paymentRouter.post("/create", isAuth, paymentController.createPreference);
  paymentRouter.post("/webhook", paymentController.webhook);

  return paymentRouter;
};
