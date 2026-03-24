import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { isAuth } from "../middlewares/isAuth.js";
import multer from "multer";
import { UserModel } from "../models/user.models.js";

export const createUserRouter = ({ db }) => {
  const userRouter = Router();
  const userModel = new UserModel(db)
  const userController = new UserController({ model: userModel });
  const upload = multer({ storage: multer.memoryStorage() });

  // Perfíl de usaurios y actualización (privado)
  userRouter.get("/profile", isAuth, userController.userProfile);
  userRouter.get("/id", isAuth, userController.getUserById);
  userRouter.put("/update", isAuth, upload.single("image"), userController.updateUser);

  // Contenido usuario admin (Público)
  userRouter.get("/user_hero", userController.getUserClientHero);
  userRouter.get("/user_footer", userController.getUserClientFooter);
  userRouter.get("/content", userController.getUserContent);

  // Contenido usuario admin (Privado)
  userRouter.post("/user_hero", isAuth, upload.single("heroUrlImage"), userController.updateUserClientHero);
  userRouter.post("/user_footer", isAuth, upload.single("footerUrlImage"), userController.updateUserClientFooter);
  userRouter.patch("/update", isAuth, userController.updateUserShippingInformation);
  userRouter.patch("/content-update", isAuth, userController.updateUserContent);

  // Eliminación de usuarios
  userRouter.delete("/delete", isAuth, userController.deleteUser);

  return userRouter;
};
