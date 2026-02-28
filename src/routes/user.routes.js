import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { isAuth } from "../middlewares/isAuth.js";
import multer from "multer";

export const createUserRouter = ({ db }) => {
  const userRouter = Router();
  const userController = new UserController({ db });
  const upload = multer({ storage: multer.memoryStorage() });

  userRouter.get("/profile", isAuth, userController.userProfile);
  userRouter.get("/id", isAuth, userController.getUserById);
  userRouter.put("/update", isAuth, upload.single("image"), userController.updateUser);
  userRouter.delete("/delete", isAuth, userController.deleteUser);
  userRouter.get("/user_hero", userController.getUserClientHero);
  userRouter.get("/user_footer", userController.getUserClientFooter);
  userRouter.post("/user_hero/:id", isAuth, upload.single("heroUrlImage") ,userController.updateUserClientHero);
  userRouter.post("/user_footer/:id", isAuth, upload.single("footerUrlImage") ,userController.updateUserClientFooter);
  userRouter.patch("/update", isAuth, userController.updateUserShippingInformation);
  userRouter.get("/content", userController.getUserDiscounContent);
  userRouter.patch("/content-update", isAuth, userController.updateUserDiscountContent);

  return userRouter;
};
