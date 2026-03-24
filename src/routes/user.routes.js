import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { isAuth } from "../middlewares/isAuth.js";
import multer from "multer";
import { UserModel } from "../models/user.models.js";

export const createUserRouter = ({ db }) => {
  const userRouter = Router();
  const userModel = new UserModel(db);
  const userController = new UserController({ model: userModel });
  const upload = multer({ storage: multer.memoryStorage() });

  // ── Públicas
  userRouter.get("/hero", userController.getUserClientHero);
  userRouter.get("/footer", userController.getUserClientFooter);
  userRouter.get("/content", userController.getUserContent);

  // ── Protegidas
  userRouter.get("/profile", isAuth, userController.userProfile);
  userRouter.get("/", isAuth, userController.getUserById);

  // ---- Contenido del administrador
  userRouter.put("/", isAuth, upload.single("image"), userController.updateUser);
  userRouter.put("/hero", isAuth, upload.single("heroUrlImage"), userController.updateUserClientHero);
  userRouter.put("/footer", isAuth, upload.single("footerUrlImage"), userController.updateUserClientFooter);

  userRouter.patch("/shipping", isAuth, userController.updateUserShippingInformation);
  userRouter.patch("/content", isAuth, userController.updateUserContent);

  userRouter.delete("/", isAuth, userController.deleteUser);

  return userRouter;
};
