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

  // =========================
  // PERFIL (privado)
  // =========================
  userRouter.get("/profile", isAuth, userController.userProfile);
  userRouter.get("/:id", isAuth, userController.getUserById);

  // Actualización parcial del perfil
  userRouter.patch(
    "/profile",
    isAuth,
    upload.single("image"),
    userController.updateUser
  );

  // =========================
  // CONTENIDO (público)
  // =========================
  userRouter.get("/content", userController.getUserContent);
  userRouter.get("/content/hero", userController.getUserClientHero);
  userRouter.get("/content/footer", userController.getUserClientFooter);

  // =========================
  // CONTENIDO (privado - admin)
  // =========================

  // Hero (imagen + datos)
  userRouter.patch(
    "/content/hero",
    isAuth,
    upload.single("heroUrlImage"),
    userController.updateUserClientHero
  );

  // Footer (imagen + datos)
  userRouter.patch(
    "/content/footer",
    isAuth,
    upload.single("footerUrlImage"),
    userController.updateUserClientFooter
  );

  // Información datos de envío usuarios
  userRouter.patch(
    "/content/shipping",
    isAuth,
    userController.updateUserShippingInformation
  );

  // Otros cambios generales de contenido
  userRouter.patch(
    "/content",
    isAuth,
    userController.updateUserContent
  );

  // =========================
  // ELIMINACIÓN
  // =========================
  userRouter.delete("/profile", isAuth, userController.deleteUser);

  return userRouter;
};