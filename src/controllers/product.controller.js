import {
  CREATE_PRODUCT,
  DELETE_PRODUCT,
  GET_ALL_PRODUCTS,
  GET_ALL_PRODUCTS_BY_USER_ID,
  GET_PRODUCT_BY_ID,
} from "./constants.js";
import { updateToBlob } from "../services/vercelBlob.service.js";

export class ProductController {
  constructor({ db }) {
    this.db = db;
  }

  getFirstRow = (result) => result?.rows?.[0] || result?.[0];

  listAllProducts = async (req, res) => {
    try {
      const result = await this.db.query(GET_ALL_PRODUCTS)
      const products = result?.rows || result;
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
      const result = await this.db.query(GET_ALL_PRODUCTS_BY_USER_ID, [userId]);
      const products = result?.rows || result;

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
      const result = await this.db.query(GET_PRODUCT_BY_ID, [id]);
      const product = this.getFirstRow(result);

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
    const file = req.file ?? null;
    const {
      name,
      price,
      stock,
      condition,
      description,
      brand,
      temp,
      size,
      color,
      category,
      user_id,
    } = req.body;

    const imageUrl = file ? await updateToBlob(file) : null;
    try {
      const result = await this.db.query(CREATE_PRODUCT, [
        name,
        price,
        stock,
        condition,
        imageUrl,
        description,
        brand,
        temp,
        size,
        color,
        category,
        user_id,
      ]);
      const newProduct = this.getFirstRow(result);

      return res.status(201).json(newProduct);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al crear el producto: " + error.message });
    }
  };

  updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, category, price, stock, brand, temp, size, color, image } = req.body;
    try {
      let imgUrl = null
      if (image) {
        imgUrl = await updateToBlob(image)
      }
      const result = await this.db.query(
        "UPDATE products SET name = $1, description = $2, category = $3 price = $4 stock = $5 brand = $6 temp = $7 temp = $8 size = $9 color = $10 image = $11 WHERE id = $12 RETURNING *",
        [name, description, category, price, stock, brand, temp, size, color, imgUrl, id]
      );
      const updatedProduct = this.getFirstRow(result);

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
      const result = await this.db.query(DELETE_PRODUCT, [id]);
      const deletedProduct = this.getFirstRow(result);
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
