import { deleteFromBlob } from "../services/vercelBlob.service.js";

export class ProductController {
  constructor({ model }) {
    this.model = model;
  }

  listAllProducts = async (req, res) => {
    try {
      const products = await this.model.getAllProducts();
      if (products.length === 0)
        return res.json({ message: "No hay productos en la base de datos." });

      return res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener los productos." })
    }
  }

  getAllProductsByUserId = async (req, res) => {
    const { userId } = req;
    try {
      const products = await this.model.getAllProductsByUserId(userId);

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
    const { id } = req.params;
    try {
      const product = await this.model.getProductById(id);

      if (!product)
        return res.status(404).json({ message: "Producto no encontrado" });

      return res.status(200).json(product);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al obtener el producto: " + error.message });
    }
  };

  createProduct = async (req, res) => {
    const {
      name,
      price,
      stock,
      condition,
      description,
      imageUrls,
      brand,
      temp,
      size,
      color,
      category,
      user_id,
    } = req.body;

    try {
      // Serializar el array de URLs como JSON para la columna `image`
      const imageJson = Array.isArray(imageUrls) ? JSON.stringify(imageUrls) : (imageUrls ?? null);

      const newProduct = await this.model.createProduct({
        name,
        price,
        stock,
        condition,
        image: imageJson,
        description,
        brand,
        temp,
        size,
        color,
        category,
        user_id,
      });

      return res.status(201).json({ product: newProduct });

    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al crear el producto: " + error.message });
    }
  };

  updateProduct = async (req, res) => {
    const { id } = req.params;
    // El frontend envía application/json con imageUrls: string[] (ya subidas a Vercel Blob)
    const { name, description, category, price, stock, condition, brand, temp, size, color, imageUrls } = req.body;

    try {
      let imageJson;

      if (Array.isArray(imageUrls) && imageUrls.length > 0) {
        // URLs llegaron del frontend (nuevas + existentes combinadas)
        imageJson = JSON.stringify(imageUrls);
      } else {
        // No se enviaron URLs → conservar las imágenes actuales de la BD
        const currentProduct = await this.model.getProductById(id);
        imageJson = currentProduct?.image ?? null;
      }

      const updatedProduct = await this.model.updateProduct({
        id,
        name,
        description,
        category,
        price,
        stock,
        condition,
        image: imageJson,
        brand,
        temp,
        size,
        color,
      });

      if (!updatedProduct)
        return res.status(404).json({ message: "Producto no encontrado" });

      return res.status(200).json(updatedProduct);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al actualizar el producto: " + error.message });
    }
  };

  deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
      // Obtener el producto para acceder a sus imágenes
      const product = await this.model.getProductById(id);

      if (!product)
        return res.status(404).json({ message: "Producto no encontrado" });

      // Eliminar imágenes del blob storage si existen
      if (product.image) {
        try {
          const imageUrls = JSON.parse(product.image);
          await Promise.all(
            imageUrls.map(url => deleteFromBlob(url))
          );
        } catch (parseError) {
          console.error("Error al parsear imágenes:", parseError);
          // Continuar con la eliminación del producto aunque falle la limpieza de imágenes
        }
      }

      // Eliminar producto de la base de datos
      const deletedProduct = await this.model.deleteProduct(id);

      if (!deletedProduct)
        return res.status(404).json({ message: "Producto no encontrado" });

      return res
        .status(200)
        .json({ message: "Producto eliminado correctamente" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al eliminar el producto: " + error.message });
    }
  };
}
