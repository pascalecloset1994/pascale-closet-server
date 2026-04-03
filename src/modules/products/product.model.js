export class ProductModel {
    constructor(db) {
        this.db = db;
    }

    getFirstRow = (result) => result?.rows?.[0] || result?.[0];
    getRows = (result) => result?.rows || result || [];

    async getPublicProductsV2() {
        try {
            const result = await this.db.query(`
                SELECT
                    p.id, p.user_id, p.name, p.description, p.brand, p.category, p.season, p.condition,
                    COALESCE(v.variants, '[]'::json) AS variants,
                    COALESCE(i.images, '[]'::json) AS images,
                    COALESCE(r.reviews, '[]'::json) AS reviews
                FROM catalog.products p
                LEFT JOIN LATERAL (
                    SELECT json_agg(pv ORDER BY pv.id) AS variants
                    FROM catalog.product_variants pv
                    WHERE pv.product_id = p.id
                ) v ON TRUE
                LEFT JOIN LATERAL (
                    SELECT json_agg(pi ORDER BY pi.sort_order, pi.id) AS images
                    FROM catalog.product_images pi
                    WHERE pi.product_id = p.id
                ) i ON TRUE
                LEFT JOIN LATERAL (
                    SELECT json_agg(pr ORDER BY pr.created_at DESC, pr.id DESC) AS reviews
                    FROM catalog.product_reviews pr
                    WHERE pr.product_id = p.id
                ) r ON TRUE
                ORDER BY p.id DESC;
            `);

            return this.getRows(result);
        } catch (error) {
            throw error;
        }
    }

    async getAllProductsByUserId_V2(userId) {
        try {
            const result = await this.db.query(`
                SELECT
                    p.id, p.user_id, p.name, p.description, p.brand, p.category, p.season, p.condition,
                    COALESCE(v.variants, '[]'::json) AS variants,
                    COALESCE(i.images, '[]'::json) AS images
                FROM catalog.products p
                LEFT JOIN LATERAL (
                    SELECT json_agg(pv ORDER BY pv.id) AS variants
                    FROM catalog.product_variants pv
                    WHERE pv.product_id = p.id
                ) v ON TRUE
                LEFT JOIN LATERAL (
                    SELECT json_agg(pi ORDER BY pi.sort_order, pi.id) AS images
                    FROM catalog.product_images pi
                    WHERE pi.product_id = p.id
                ) i ON TRUE
                WHERE p.user_id = $1
                ORDER BY p.id DESC;
            `, [userId]);

            return this.getRows(result);
        } catch (error) {
            throw error;
        }
    }

    async getProductByIdWithRelations_V2(productId) {
        try {
            const result = await this.db.query(`
                SELECT
                    p.id, p.user_id, p.name, p.description, p.brand, p.category, p.season, p.condition,
                    COALESCE(v.variants, '[]'::json) AS variants,
                    COALESCE(i.images, '[]'::json) AS images
                FROM catalog.products p
                LEFT JOIN LATERAL (
                    SELECT json_agg(pv ORDER BY pv.id) AS variants
                    FROM catalog.product_variants pv
                    WHERE pv.product_id = p.id
                ) v ON TRUE
                LEFT JOIN LATERAL (
                    SELECT json_agg(pi ORDER BY pi.sort_order, pi.id) AS images
                    FROM catalog.product_images pi
                    WHERE pi.product_id = p.id
                ) i ON TRUE
                WHERE p.id = $1;
            `, [productId]);

            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    // ----- Nuevos métodos para arquitectura de datos products_V2

    async getAllProducts_V2() {
        try {
            const result = await this.db.query("SELECT id, user_id, name, description, brand, category, season, condition FROM catalog.products;");
            return this.getRows(result);
        } catch (error) {
            throw error;
        }
    }

    async getProductById_V2(id) {
        try {
            const result = await this.db.query(
                "SELECT id, user_id, name, description, brand, category, season, condition FROM catalog.products WHERE id = $1;",
                [id]
            );
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async createProduct_V2({ userId, name, description, brand, category, season, condition }) {
        try {
            const result = await this.db.query(`
                INSERT INTO catalog.products (user_id, name, description, brand, category, season, condition)
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;
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

    async updateProduct_V2({ id, name, description, brand, category, season, condition }) {
        try {
            const result = await this.db.query(`
                UPDATE catalog.products
                SET name = $2,
                    description = $3,
                    brand = $4,
                    category = $5,
                    season = $6,
                    condition = $7
                WHERE id = $1
                RETURNING id;
                `, [
                id,
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

    async deleteProduct_V2(id) {
        try {
            const result = await this.db.query(
                "DELETE FROM catalog.products WHERE id = $1 RETURNING id;",
                [id]
            );
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async setProductVariants_V2({ productId, size, color, price, stock, sku }) {
        try {
            const result = await this.db.query(`
                INSERT INTO catalog.product_variants (product_id, size, color, price, stock, sku)
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;
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

    async createProductVariants_V2({ productId, variants }) {
        const client = await this.db.connect();
        try {
            await client.query("BEGIN;");

            const createdVariants = [];

            for (const variant of variants) {
                const result = await client.query(`
                    INSERT INTO catalog.product_variants (product_id, size, color, price, stock, sku)
                    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, product_id, size, color, price, stock, sku;
                    `, [
                    productId,
                    variant.size ?? null,
                    variant.color ?? null,
                    variant.price,
                    variant.stock,
                    variant.sku ?? null,
                ]);

                createdVariants.push(this.getFirstRow(result));
            }

            await client.query("COMMIT;");
            return createdVariants;
        } catch (error) {
            await client.query("ROLLBACK;");
            throw error;
        } finally {
            client.release();
        }
    }

    async getProductVariantById_V2({ productId, variantId }) {
        try {
            const result = await this.db.query(
                "SELECT id, product_id, size, color, price, stock, sku FROM catalog.product_variants WHERE id = $1 AND product_id = $2;",
                [variantId, productId]
            );
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async updateProductVariant_V2({ productId, variantId, size, color, price, stock, sku }) {
        try {
            const result = await this.db.query(`
                UPDATE catalog.product_variants
                SET size = $3,
                    color = $4,
                    price = $5,
                    stock = $6,
                    sku = $7
                WHERE id = $1 AND product_id = $2
                RETURNING id, product_id, size, color, price, stock, sku;
                `, [
                variantId,
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

    async deleteProductVariant_V2({ productId, variantId }) {
        try {
            const result = await this.db.query(
                "DELETE FROM catalog.product_variants WHERE id = $1 AND product_id = $2 RETURNING id, product_id, size, color, price, stock, sku;",
                [variantId, productId]
            );
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async setProductImages_V2(productId, url, sortOrder) {
        try {
            const result = await this.db.query(`
                INSERT INTO catalog.product_images (product_id, url, sort_order)
                VALUES ($1, $2, $3) RETURNING id, product_id, url, sort_order;
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

    async createProductImages_V2({ productId, images }) {
        const client = await this.db.connect();
        try {
            await client.query("BEGIN;");

            const createdImages = [];

            for (let index = 0; index < images.length; index++) {
                const image = images[index];

                const result = await client.query(`
                    INSERT INTO catalog.product_images (product_id, url, sort_order)
                    VALUES ($1, $2, $3) RETURNING id, product_id, url, sort_order;
                    `, [
                    productId,
                    image.url,
                    image.sortOrder ?? index,
                ]);

                createdImages.push(this.getFirstRow(result));
            }

            await client.query("COMMIT;");
            return createdImages;
        } catch (error) {
            await client.query("ROLLBACK;");
            throw error;
        } finally {
            client.release();
        }
    }

    async getProductImageById_V2({ productId, imageId }) {
        try {
            const result = await this.db.query(
                "SELECT id, product_id, url, sort_order FROM catalog.product_images WHERE id = $1 AND product_id = $2;",
                [imageId, productId]
            );
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async updateProductImage_V2({ productId, imageId, url, sortOrder }) {
        try {
            const result = await this.db.query(`
                UPDATE catalog.product_images
                SET url = $3,
                    sort_order = $4
                WHERE id = $1 AND product_id = $2
                RETURNING id, product_id, url, sort_order;
                `, [
                imageId,
                productId,
                url,
                sortOrder,
            ]);
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async deleteProductImage_V2({ productId, imageId }) {
        try {
            const result = await this.db.query(
                "DELETE FROM catalog.product_images WHERE id = $1 AND product_id = $2 RETURNING id, product_id, url, sort_order;",
                [imageId, productId]
            );
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async getAllProductReviews() {
        try {
            const result = await this.db.query(
                "SELECT id, product_id, user_id, rating, comment, author_name, author_avatar, active, updated, created_at, updated_at FROM catalog.product_reviews;");
            return this.getRows(result);
        } catch (error) {
            throw error;
        }
    }

    async getProductReviewsByProductId(productId) {
        try {
            const result = await this.db.query(
                "SELECT id, product_id, user_id, rating, comment, author_name, author_avatar, active, updated, created_at, updated_at FROM catalog.product_reviews WHERE product_id = $1 ORDER BY created_at DESC;",
                [productId]
            );
            return this.getRows(result);
        } catch (error) {
            throw error;
        }
    }

    async getProductReviewByUser(productId, userId) {
        try {
            const result = await this.db.query(
                "SELECT id, product_id, user_id, rating, comment, author_name, author_avatar, active, updated, created_at, updated_at FROM catalog.product_reviews WHERE product_id = $1 AND user_id = $2;",
                [productId, userId]
            );
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async createProductReview({ productId, userId, rating, comment, authorName, authorAvatar }) {
        try {
            const result = await this.db.query(`
                INSERT INTO catalog.product_reviews (product_id, user_id, rating, comment, author_name, author_avatar)
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, product_id, user_id, rating, comment, author_name, author_avatar, active, updated, created_at, updated_at;
                `,
                [productId, userId, rating, comment, authorName, authorAvatar]
            );
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async updateProductReview({ productId, userId, rating, comment, authorName, active }) {
        const client = await this.db.connect();
        try {
            await client.query("BEGIN;");
            const result = await client.query(`
                UPDATE catalog.product_reviews SET rating = $3, 
                comment = $4, 
                author_name = $5,
                active = $6,
                updated_at = NOW(),
                updated = TRUE
                WHERE product_id = $1
                AND user_id = $2
                RETURNING id, product_id, user_id, rating, comment, author_name, author_avatar, active, updated, created_at, updated_at;
                `,
                [productId, userId, rating, comment, authorName, active]
            );
            await client.query("COMMIT;");
            return this.getFirstRow(result);
        } catch (error) {
            await client.query("ROLLBACK;");
            throw error;
        } finally {
            client.release();
        }
    }

    async deleteProductReview(userId, productId) {
        try {
            const result = await this.db.query(`
                DELETE FROM catalog.product_reviews WHERE user_id = $1 AND product_id = $2 RETURNING id, product_id, user_id, rating, comment, author_name, author_avatar, active, updated, created_at, updated_at;
                `,
                [userId, productId]
            );
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }
}
