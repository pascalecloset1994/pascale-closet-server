import { Router } from "express";
import { LogsController } from "./logs.controller.js";

export const createLogsRouter = ({ db }) => {
   const logsRouter = Router();
   const logsController = new LogsController({ db });

   logsRouter.post("/loger", logsController.createLog);

   return logsRouter;
};
