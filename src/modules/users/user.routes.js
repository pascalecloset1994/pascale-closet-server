import { Router } from "express";
import { UserController } from "./user.controller.js";
import { isAuth } from "../../middlewares/isAuth.js";
import multer from "multer";
import { UserModel } from "./user.model.js";

export const createUserRouter = ({ db }) => {
  const userRouter = Router();
  const userModel = new UserModel(db);
  const userController = new UserController({ model: userModel });
  const upload = multer({ storage: multer.memoryStorage() });

  // =========================
  // CONTENIDO (público)
  // =========================
  userRouter.get("/content_v2", userController.getUserContent_V2);
  userRouter.get("/content/hero", userController.getUserHeroContent_V2);
  userRouter.get("/content/footer", userController.getUserFooterContent_V2);
  userRouter.get("/content/shipping", userController.getShippingPrice_V2);
  userRouter.get("/content/discount", userController.getDiscountContent_V2);

  // =========================
  // PERFIL (privado)
  // =========================
  userRouter.get("/all-users", isAuth, userController.getAllUsers);
  userRouter.get("/profile", isAuth, userController.userProfile);
  userRouter.get("/:id", isAuth, userController.getUserById);

  userRouter.patch(
    "/profile",
    isAuth,
    upload.single("image"),
    userController.updateUser
  );

  userRouter.patch(
    "/profile/shipping",
    isAuth,
    userController.updateUserShippingInformation
  );

  // =========================
  // CONTENIDO (privado - admin)
  // =========================
  userRouter.patch(
    "/content/hero",
    isAuth,
    upload.single("heroUrlImage"),
    userController.updateUserHeroContent_V2
  );

  userRouter.patch(
    "/content/footer",
    isAuth,
    upload.single("footerUrlImage"),
    userController.updateUserFooterContent_V2
  );

  userRouter.patch(
    "/content/shipping",
    isAuth,
    userController.updateShippingContent_V2
  );

  userRouter.patch(
    "/content/discount",
    isAuth,
    userController.updateDiscountContent_V2
  );

  // =========================
  // ELIMINACIÓN
  // =========================
  userRouter.delete("/profile", isAuth, userController.deleteUser);

  return userRouter;
};