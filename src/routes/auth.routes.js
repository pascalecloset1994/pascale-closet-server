import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { isAuth } from "../middlewares/isAuth.js";

export const createAuthRouter = ({ db }) => {
  const authRouter = Router();
  const authController = new AuthController({ db });

  authRouter.post("/signup", authController.signUp);
  authRouter.post("/login", authController.userLogin);
  authRouter.get("/logout", isAuth, authController.userLogout);
  authRouter.post("/recovery-password", authController.recoveryPassword);
  authRouter.post("/reset-password", authController.resetPassword);

  return authRouter;
};
