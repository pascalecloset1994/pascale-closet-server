import { Router } from "express";
import { ProductController } from "../controllers/product.controller.js";
import multer from "multer";
import { isAuth } from "../middlewares/isAuth.js";

export const createProductsRouter = ({ db }) => {
  const productsRouter = Router();
  const upload = multer({ storage: multer.memoryStorage() });
  const productController = new ProductController({ db });

  productsRouter.get("/list-products", productController.listAllProducts)
  productsRouter.get("/products", isAuth, productController.getAllProductsByUserId);
  productsRouter.get("/product/:id", isAuth, productController.getProductById);
  productsRouter.post("/product", upload.single("image"), productController.createProduct);
  productsRouter.put("/product/:id", isAuth, productController.updateProduct);
  productsRouter.delete("/product/:id", isAuth, productController.deleteProduct);

  return productsRouter;
};
