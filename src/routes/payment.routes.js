import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller.js";
import { OrderModel } from "../models/order.models.js";
import { PaymentModel } from "../models/payment.models.js";

export const createPaymentRouter = ({ db }) => {
  const paymentRouter = Router();
  const orderModel = new OrderModel(db);
  const paymentModel = new PaymentModel(db);
  const paymentController = new PaymentController({ orderModel, paymentModel, db });

  paymentRouter.post("/create", paymentController.createPreference);
  paymentRouter.post("/webhook", paymentController.webhook);

  return paymentRouter;
};
