import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { AuthModel } from "./auth.model.js";

export const createAuthRouter = ({ db }) => {
  const authRouter = Router();
  const authModel = new AuthModel(db);
  const authController = new AuthController({ model: authModel });

  authRouter.post("/signup", authController.signUp);
  authRouter.post("/login", authController.userLogin);
  authRouter.post("/logout", authController.userLogout);
  authRouter.post("/recovery-password", authController.recoveryPassword);
  authRouter.post("/reset-password", authController.resetPassword);

  return authRouter;
};
