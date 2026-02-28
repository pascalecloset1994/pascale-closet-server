import { Router } from "express";
import { OrderController } from "../controllers/order.controller.js";
import { OrderModel } from "../models/order.models.js";

export const createOrderRouter = ({ db }) => {
  const orderRouter = Router();

  const orderModel = new OrderModel(db);
  const orderController = new OrderController({ orderModel });

  orderRouter.get("/seller/orders", orderController.getAllOrders);
  orderRouter.get("/user/orders/:user_id", orderController.getUserOrders);
  orderRouter.get("/user/order/:order_id", orderController.getOrderById);
  orderRouter.get("/orders/:order_id/details", orderController.getOrderDetails);
  orderRouter.post("/orders", orderController.createOrder);
  orderRouter.patch("/orders/:order_id/status", orderController.updateOrderStatus);
  orderRouter.delete("/order/:order_id", orderController.deleteOrder);

  return orderRouter;
};
