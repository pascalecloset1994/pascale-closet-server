export class ProductModel {
    constructor(db) {
        this.db = db;
    }

    getFirstRow = (result) => result?.rows?.[0] || result?.[0];
    getRows = (result) => result?.rows || result || [];

    async getAllProducts() {
        try {
            const result = await this.db.query("SELECT * FROM products;");
            return this.getRows(result);
        } catch (error) {
            throw error;
        }
    }

    async getAllProductsByUserId(userId) {
        try {
            const result = await this.db.query(
                "SELECT * FROM products WHERE user_id = $1;",
                [userId],
            );
            return this.getRows(result);
        } catch (error) {
            throw error;
        }
    }

    async getProductById(id) {
        try {
            const result = await this.db.query("SELECT * FROM products WHERE id = $1;", [
                id,
            ]);
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async createProduct({
        name,
        price,
        stock,
        condition,
        image,
        description,
        brand,
        season,
        size,
        color,
        category,
        user_id,
    }) {
        try {
            const result = await this.db.query(
                `INSERT INTO products (name, price, stock, condition, image, description, brand, season, size, color, category, user_id)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *;`,
                [
                    name,
                    price,
                    stock,
                    condition,
                    image,
                    description,
                    brand,
                    season,
                    size,
                    color,
                    category,
                    user_id,
                ],
            );

            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async updateProduct({
        id,
        name,
        description,
        category,
        price,
        stock,
        condition,
        image,
        brand,
        seaosn,
        size,
        color,
    }) {
        try {
            const result = await this.db.query(
                "UPDATE products SET name = $1, description = $2, category = $3, price = $4, stock = $5, condition = $6, image = $7, brand = $8, season = $9, size = $10, color = $11 WHERE id = $12 RETURNING *;",
                [
                    name,
                    description,
                    category,
                    price,
                    stock,
                    condition,
                    image,
                    brand,
                    seaosn,
                    size,
                    color,
                    id,
                ],
            );

            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            const result = await this.db.query(
                "DELETE FROM products WHERE id = $1 RETURNING *;",
                [id],
            );
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    // ----- Nuevos métodos para arquitectura de datos products_V2

    async getAllProducts_V2() {
        try {
            const result = await this.db.query("SELECT * FROM products_v2;");
            return this.getRows(result);
        } catch (error) {
            throw error;
        }
    }

    async createProduct_V2({ userId, name, description, brand, category, season, condition }) {
        try {
            const result = await this.db.query(`
                INSERT INTO products_v2 (user_id, name, description, brand, category, season, condition)
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
                `, [
                userId,
                name,
                description,
                brand,
                category,
                season,
                condition,
            ]);
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async setProductVariants_V2({ productId, size, color, price, stock, sku }) {
        try {
            const result = await this.db.query(`
                INSERT INTO product_variants (product_id, size, color, price, stock, sku)
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
                `, [
                productId,
                size,
                color,
                price,
                stock,
                sku,
            ]);
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async setProductImages_V2(productId, url, sortOrder) {
        try {
            const result = await this.db.query(`
                INSERT INTO product_images (product_id, url, sort_order)
                VALUES ($1, $2, $3) RETURNING *;
                `, [
                productId,
                url,
                sortOrder
            ]);
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async getAllProductReviews() {
        try {
            const result = await this.db.query(
                "SELECT * FROM products_reviews;");
            return this.getRows(result);
        } catch (error) {
            throw error;
        }
    }

    async getProductReviewsById(id) {
        try {
            const result = await this.db.query(
                "SELECT * FROM products_reviews WHERE product_id = $1;",
                [id]
            );
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }
}
