import { Router } from "express";
import { OrderController } from "./order.controller.js";
import { OrderModel } from "./order.model.js";

export const createOrderRouter = ({ db }) => {
  const orderRouter = Router();

  const orderModel = new OrderModel(db);
  const orderController = new OrderController({ orderModel });

  orderRouter.get("/orders/seller", orderController.getAllOrders);
  orderRouter.get("/orders/user/:user_id", orderController.getUserOrders);      
  orderRouter.get("/orders/:order_id/details", orderController.getOrderDetails);
  orderRouter.get("/orders/:order_id", orderController.getOrderById);       
  orderRouter.post("/orders", orderController.createOrder);                       
  orderRouter.patch("/orders/:order_id/status", orderController.updateOrderStatus);
  orderRouter.delete("/orders/:order_id", orderController.deleteOrder);

  return orderRouter;
};
