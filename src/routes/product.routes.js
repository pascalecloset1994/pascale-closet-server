import { Router } from "express";
import { ProductController } from "../controllers/product.controller.js";
import multer from "multer";
import { isAuth } from "../middlewares/isAuth.js";

export const createProductsRouter = ({ db }) => {
  const productsRouter = Router();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 15 * 1024 * 1024, // 15MB máximo por archivo (iPhone 15 puede enviar ~5-10MB)
      files: 3,
    },
  });
  const productController = new ProductController({ db });

  productsRouter.get("/list-products", productController.listAllProducts)
  productsRouter.get("/products", isAuth, productController.getAllProductsByUserId);
  productsRouter.get("/product/:id", isAuth, productController.getProductById);
  productsRouter.post("/product", upload.array("images", 3), productController.createProduct);
  productsRouter.put("/product/:id", isAuth, upload.array("images", 3), productController.updateProduct);
  productsRouter.delete("/product/:id", isAuth, productController.deleteProduct);

  return productsRouter;
};
