import { Router } from "express";
import { ProductController } from "../controllers/product.controller.js";
import { isAuth } from "../middlewares/isAuth.js";
import { ProductModel } from "../models/product.model.js";

export const createProductsRouter = ({ db }) => {
  const productsRouter = Router();
  const productModel = new ProductModel(db);
  const productController = new ProductController({ model: productModel });

  productsRouter.get("/list-products", productController.listAllProducts);
  productsRouter.get("/products", isAuth, productController.getAllProductsByUserId);
  productsRouter.get("/product/:id", isAuth, productController.getProductById);

  productsRouter.post("/product-v2", isAuth, productController.createProduct_V2);
  productsRouter.patch("/product-v2/:productId", isAuth, productController.updateProduct_V2);
  productsRouter.delete("/product-v2/:productId", isAuth, productController.deleteProduct_V2);

  productsRouter.post("/product-v2/:productId/variants", isAuth, productController.setProductVariants_V2);
  productsRouter.patch("/product-v2/:productId/variants/:variantId", isAuth, productController.updateProductVariant_V2);
  productsRouter.delete("/product-v2/:productId/variants/:variantId", isAuth, productController.deleteProductVariant_V2);

  productsRouter.post("/product-v2/:productId/images", isAuth, productController.setProductImages_V2);
  productsRouter.patch("/product-v2/:productId/images/:imageId", isAuth, productController.updateProductImage_V2);
  productsRouter.delete("/product-v2/:productId/images/:imageId", isAuth, productController.deleteProductImage_V2);

  // POST y PUT reciben application/json — las imágenes ya están en Vercel Blob
  productsRouter.post("/product", isAuth, productController.createProduct);
  productsRouter.put("/product/:id", isAuth, productController.updateProduct);
  productsRouter.delete("/product/:id", isAuth, productController.deleteProduct);

  productsRouter.post("/product/:id/review", isAuth, productController.createProductReview);
  productsRouter.delete("/product/:id/review", isAuth, productController.deleteProductReview);
  productsRouter.patch("/product/:id/review", isAuth, productController.updateProductReview);

  return productsRouter;
};
