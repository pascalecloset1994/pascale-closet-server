import { neonDB } from "../config/dbConfig.js";

export class ProductController {
  constructor({ model }) {
    this.model = model;
  }

  listAllProducts = async (req, res) => {
    try {
      const products = await this.model.getPublicProductsV2();

      if (products.length === 0) {
        return res.json({ message: "No hay productos en la base de datos." });
      }

      return res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener los productos: " + error.message })
    }
  }

  getAllProductsByUserId = async (req, res) => {
    const { userId } = req;
    try {
      const products = await this.model.getAllProductsByUserId_V2(userId);

      if (products.length === 0)
        return res.json({ message: "No hay productos en la base de datos." });

      return res.status(200).json(products);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error en el servidor: " + error.message });
    }
  };

  getProductById = async (req, res) => {
    const { productId } = req.params;
    try {
      const product = await this.model.getProductByIdWithRelations_V2(productId);

      if (!product)
        return res.status(404).json({ message: "Producto no encontrado" });

      const reviews = await this.model.getProductReviewsByProductId(productId);

      return res.status(200).json({
        ...product,
        reviews,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al obtener el producto: " + error.message });
    }
  };

  // ---- Products_V2 -----------------------------------------------------------

  createProduct_V2 = async (req, res) => {
    const authUserId = req.userId;
    const {
      userId, name, description, brand, category, season, condition
    } = req.body;

    const ownerId = authUserId ?? userId;

    if (!ownerId || !name) {
      return res.status(400).json({ message: "Faltan campos requeridos: userId, name" });
    }

    try {
      const newProduct = await this.model.createProduct_V2({
        userId: ownerId, name, description, brand, category, season, condition
      });

      return res.status(201).json({
        product: { ...newProduct }
      });
    } catch (error) {
      console.error("[createProduct_V2]", error);
      return res.status(500).json({ message: "Error al crear el producto (V2): " + error.message });
    }
  };

  updateProduct_V2 = async (req, res) => {
    const { productId } = req.params;
    const { name, description, brand, category, season, condition } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Falta productId en la ruta." });
    }

    try {
      const currentProduct = await this.model.getProductById_V2(productId);

      if (!currentProduct) {
        return res.status(404).json({ message: "Producto V2 no encontrado." });
      }

      const updatedProduct = await this.model.updateProduct_V2({
        id: productId,
        name: name ?? currentProduct.name,
        description: description ?? currentProduct.description,
        brand: brand ?? currentProduct.brand,
        category: category ?? currentProduct.category,
        season: season ?? currentProduct.season,
        condition: condition ?? currentProduct.condition,
      });

      return res.status(200).json({ product: updatedProduct });
    } catch (error) {
      console.error("[updateProduct_V2]", error);
      return res.status(500).json({ message: "Error al actualizar el producto (V2): " + error.message });
    }
  }

  deleteProduct_V2 = async (req, res) => {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: "Falta productId en la ruta." });
    }

    try {
      const currentProduct = await this.model.getProductById_V2(productId);

      if (!currentProduct) {
        return res.status(404).json({ message: "Producto V2 no encontrado." });
      }

      const deletedProduct = await this.model.deleteProduct_V2(productId);

      return res.status(200).json({
        message: "Producto V2 eliminado correctamente.",
        product: deletedProduct,
      });
    } catch (error) {
      console.error("[deleteProduct_V2]", error);
      return res.status(500).json({ message: "Error al eliminar el producto (V2): " + error.message });
    }
  }

  setProductVariants_V2 = async (req, res) => {
    try {
      const { productId } = req.params;
      const { variants, size, color, price, stock, sku } = req.body;

      if (!productId) {
        return res.status(400).json({ message: "Falta productId en la ruta." });
      }

      const currentProduct = await this.model.getProductById_V2(productId);

      if (!currentProduct) {
        return res.status(404).json({ message: "Producto V2 no encontrado." });
      }

      const normalizedVariants = Array.isArray(variants)
        ? variants
        : [{ size, color, price, stock, sku }];

      if (!normalizedVariants.length) {
        return res.status(400).json({ message: "Debes enviar al menos una variante." });
      }

      const hasInvalidVariant = normalizedVariants.some((variant) =>
        variant.price === undefined || variant.stock === undefined
      );

      if (hasInvalidVariant) {
        return res.status(400).json({ message: "Cada variante requiere price y stock." });
      }

      const createdVariants = await this.model.createProductVariants_V2({
        productId,
        variants: normalizedVariants,
      });

      return res.status(201).json({
        productId: currentProduct.id,
        variants: createdVariants,
      });
    } catch (error) {
      console.error("[setProductVariants_V2]", error);
      return res.status(500).json({ message: "Error al crear variantes (V2): " + error.message });
    }
  }

  updateProductVariant_V2 = async (req, res) => {
    const { productId, variantId } = req.params;
    const { size, color, price, stock, sku } = req.body;

    if (!productId || !variantId) {
      return res.status(400).json({ message: "Faltan productId o variantId en la ruta." });
    }

    try {
      const currentProduct = await this.model.getProductById_V2(productId);

      if (!currentProduct) {
        return res.status(404).json({ message: "Producto V2 no encontrado." });
      }

      const currentVariant = await this.model.getProductVariantById_V2({ productId, variantId });

      if (!currentVariant) {
        return res.status(404).json({ message: "Variante no encontrada para este producto." });
      }

      const nextPrice = price ?? currentVariant.price;
      const nextStock = stock ?? currentVariant.stock;

      if (nextPrice === undefined || nextStock === undefined) {
        return res.status(400).json({ message: "La variante debe tener price y stock." });
      }

      const updatedVariant = await this.model.updateProductVariant_V2({
        productId,
        variantId,
        size: size ?? currentVariant.size,
        color: color ?? currentVariant.color,
        price: nextPrice,
        stock: nextStock,
        sku: sku ?? currentVariant.sku,
      });

      return res.status(200).json({
        productId: currentProduct.id,
        variant: updatedVariant,
      });
    } catch (error) {
      console.error("[updateProductVariant_V2]", error);
      return res.status(500).json({ message: "Error al actualizar variante (V2): " + error.message });
    }
  }

  deleteProductVariant_V2 = async (req, res) => {
    const { productId, variantId } = req.params;

    if (!productId || !variantId) {
      return res.status(400).json({ message: "Faltan productId o variantId en la ruta." });
    }

    try {
      const currentProduct = await this.model.getProductById_V2(productId);

      if (!currentProduct) {
        return res.status(404).json({ message: "Producto V2 no encontrado." });
      }

      const deletedVariant = await this.model.deleteProductVariant_V2({ productId, variantId });

      if (!deletedVariant) {
        return res.status(404).json({ message: "Variante no encontrada para este producto." });
      }

      return res.status(200).json({
        message: "Variante eliminada correctamente.",
        variant: deletedVariant,
      });
    } catch (error) {
      console.error("[deleteProductVariant_V2]", error);
      return res.status(500).json({ message: "Error al eliminar variante (V2): " + error.message });
    }
  }

  setProductImages_V2 = async (req, res) => {
    try {
      const { productId } = req.params;
      const { imageUrls, urls } = req.body;

      if (!productId) {
        return res.status(400).json({ message: "Falta productId en la ruta." });
      }

      const currentProduct = await this.model.getProductById_V2(productId);

      if (!currentProduct) {
        return res.status(404).json({ message: "Producto V2 no encontrado." });
      }

      const rawUrls = Array.isArray(req.body)
        ? req.body
        : Array.isArray(imageUrls)
          ? imageUrls
          : Array.isArray(urls)
            ? urls
            : [];

      const normalizedImages = rawUrls.map((currentUrl, index) => ({
        url: typeof currentUrl === "string" ? currentUrl.trim() : currentUrl,
        sortOrder: index,
      }));

      if (!normalizedImages.length) {
        return res.status(400).json({ message: "Debes enviar imageUrls (string[]) con al menos una URL." });
      }

      const hasInvalidImage = normalizedImages.some((image) =>
        typeof image.url !== "string" || image.url.trim() === ""
      );

      if (hasInvalidImage) {
        return res.status(400).json({ message: "Cada imagen requiere url." });
      }

      const createdImages = await this.model.createProductImages_V2({
        productId,
        images: normalizedImages,
      });

      return res.status(201).json({
        productId: currentProduct.id,
        images: createdImages,
      });
    } catch (error) {
      console.error("[setProductImages_V2]", error);
      return res.status(500).json({ message: "Error al crear imágenes (V2): " + error.message });
    }
  }

  updateProductImage_V2 = async (req, res) => {
    const { productId, imageId } = req.params;
    const { imageUrl, url, sortOrder } = req.body;

    if (!productId || !imageId) {
      return res.status(400).json({ message: "Faltan productId o imageId en la ruta." });
    }

    try {
      const currentProduct = await this.model.getProductById_V2(productId);

      if (!currentProduct) {
        return res.status(404).json({ message: "Producto V2 no encontrado." });
      }

      const currentImage = await this.model.getProductImageById_V2({ productId, imageId });

      if (!currentImage) {
        return res.status(404).json({ message: "Imagen no encontrada para este producto." });
      }

      const nextUrl = (imageUrl ?? url ?? currentImage.url);

      if (typeof nextUrl !== "string" || nextUrl.trim() === "") {
        return res.status(400).json({ message: "Debes enviar imageUrl/url válido." });
      }

      const updatedImage = await this.model.updateProductImage_V2({
        productId,
        imageId,
        url: nextUrl.trim(),
        sortOrder: sortOrder ?? currentImage.sort_order,
      });

      return res.status(200).json({
        productId: currentProduct.id,
        image: updatedImage,
      });
    } catch (error) {
      console.error("[updateProductImage_V2]", error);
      return res.status(500).json({ message: "Error al actualizar imagen (V2): " + error.message });
    }
  }

  deleteProductImage_V2 = async (req, res) => {
    const { productId, imageId } = req.params;

    if (!productId || !imageId) {
      return res.status(400).json({ message: "Faltan productId o imageId en la ruta." });
    }

    try {
      const currentProduct = await this.model.getProductById_V2(productId);

      if (!currentProduct) {
        return res.status(404).json({ message: "Producto V2 no encontrado." });
      }

      const deletedImage = await this.model.deleteProductImage_V2({ productId, imageId });

      if (!deletedImage) {
        return res.status(404).json({ message: "Imagen no encontrada para este producto." });
      }

      return res.status(200).json({
        message: "Imagen eliminada correctamente.",
        image: deletedImage,
      });
    } catch (error) {
      console.error("[deleteProductImage_V2]", error);
      return res.status(500).json({ message: "Error al eliminar imagen (V2): " + error.message });
    }
  }

  createProductReview = async (req, res) => {
    const { userId } = req;
    const { productId } = req.params;
    const { rating, comment } = req.body;
    try {
      const currentProduct = await this.model.getProductById_V2(productId);

      if (!currentProduct) {
        return res.status(404).json({ message: "Producto V2 no encontrado." });
      }

      const result = await neonDB.query("SELECT * FROM users WHERE user_id = $1;", [userId]);
      const user = result.rows[0]
      const review = await this.model.createProductReview({
        productId, userId: user.user_id,
        rating,
        comment,
        authorName: user.name + " " + user.lastname,
        authorAvatar: user.avatar
      });

      return res.status(200).json({ review });
    } catch (error) {
      return res.status(500).json({ message: "Error al crear reseña: " + error.message });
    }
  }

  getProductReviewsById = async (req, res) => {
    const { productId } = req.params;
    try {
      const currentProduct = await this.model.getProductById_V2(productId);

      if (!currentProduct) {
        return res.status(404).json({ message: "Producto V2 no encontrado." });
      }

      const reviews = await this.model.getProductReviewsByProductId(productId);
      return res.status(200).json({ reviews });
    } catch (error) {
      return res.status(500).json({ message: "Error al obtener las reseñas: " + error.message });
    }
  }

  updateProductReview = async (req, res) => {
    const { productId } = req.params;
    const { rating, comment, authorName, active, userId } = req.body;

    try {
      const currentProduct = await this.model.getProductById_V2(productId);

      if (!currentProduct) {
        return res.status(404).json({ message: "Producto V2 no encontrado." });
      }

      const currentReview = await this.model.getProductReviewByUser(productId, userId);

      if (!currentReview) {
        return res.status(404).json({ message: "No se ha enontrado la reseña." })
      }

      const updatedReview = await this.model.updateProductReview({
        productId,
        userId,
        rating: rating ? rating : currentReview.rating,
        comment: comment ? comment : currentReview.comment,
        authorName: authorName ? authorName : currentReview.author_name,
        active
      });

      if (!updatedReview) {
        return res.status(400).json({ message: "No se ha encontrado la reseña." })
      }

      return res.status(200).json({ message: "Reseña actualizada.", review: updatedReview });
    } catch (error) {
      return res.status(500).json({ message: "Error al obtener las reseñas: " + error.message });
    }
  }

  deleteProductReview = async (req, res) => {
    const { userId } = req;
    const { productId } = req.params;
    try {
      const currentProduct = await this.model.getProductById_V2(productId);

      if (!currentProduct) {
        return res.status(404).json({ message: "Producto V2 no encontrado." });
      }

      const deletedReview = await this.model.deleteProductReview(userId, productId);

      if (!deletedReview) {
        return res.status(400).json({ message: "No se ha encontrado la reseña." })
      }

      return res.status(200).json({ message: "Reseña eliminada." });
    } catch (error) {
      return res.status(500).json({ message: "Error al obtener las reseñas: " + error.message });
    }
  }
}
