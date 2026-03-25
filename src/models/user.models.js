export class UserModel {

    constructor(db) {
        this.db = db;
    }
    getFirstRow = (result) => result?.rows?.[0] || result?.[0]
    getRows = (result) => result?.rows || result || []

    async getAllUsers() {
        try {
            const result = await this.db.query("SELECT * FROM users;")
            const users = this.getRows(result);
            return users;
        } catch (error) {
            throw error;
        }
    }

    async getUserById(userId) {
        try {
            const result = await this.db.query("SELECT * FROM users WHERE user_id = $1;", [userId]);
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async getUserByEmail(email) {
        try {
            const result = await this.db.query("SELECT * FROM users WHERE email = $1;", [email]);
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async createUser({ name, lastname, email, password, role, ip, city, country, postalCode }) {
        try {
            const result = await this.db.query(
                `INSERT INTO users (name, lastname, email, password, role, ip, city, country, postal_code)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (email) DO NOTHING
            RETURNING *;`, [
                name,
                lastname,
                email,
                password,
                role,
                ip,
                city,
                country,
                postalCode,
            ]);
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async updateUser({ userId, name, lastname, email, updated, avatar, city, country, postalCode, updatedAt }) {
        try {
            const result = await this.db.query(`
                UPDATE users SET name = $2, lastname = $3, email = $4, updated = $5, updated_at = NOW(), 
                avatar = $6, city = $7, country = $8, postal_code = $9 
                WHERE user_id = $1 AND updated_at IS NOT DISTINCT FROM $10 RETURNING *;
                `, [
                userId,
                name,
                lastname,
                email,
                updated,
                avatar,
                city,
                country,
                postalCode,
                updatedAt,
            ]);
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async updatePartialUser({ userId, address, phone, state, updated, updatedAt }) {
        try {
            const result = await this.db.query(`
                UPDATE users SET address = $2, phone = $3, state = $4, updated = $5, updated_at = NOW() 
                WHERE user_id = $1 AND updated_at IS NOT DISTINCT FROM $6 RETURNING *;
                `, [
                userId,
                address,
                phone,
                state,
                updated,
                updatedAt,
            ]);
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async updateUserPassword({ userId, password, updated }) {
        try {
            const result = await this.db.query("UPDATE users SET password = $2, updated = $3, updated_at = NOW() WHERE user_id = $1;", [
                userId,
                password,
                updated,
            ]);
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async deleteUser(userId) {
        try {
            const result = await this.db.query("DELETE FROM users WHERE user_id = $1 RETURNING *;", [userId]);
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async getUserHero(id) {
        try {
            const result = await this.db.query("SELECT hero_collection, hero_title, hero_subtitle, hero_url_image, hero_updated, hero_updated_at FROM user_content WHERE id = $1;", [id])
            const hero = this.getFirstRow(result);
            return hero;
        } catch (error) {
            throw error;
        }
    }

    async getHeroVersionById(id) {
        try {
            const result = await this.db.query("SELECT hero_updated_at, hero_url_image FROM user_content WHERE id = $1;", [id]);
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async updateUserHero({ id, heroCollection, heroTitle, heroSubTitle, updated, imageUrl }) {
        try {
            const result = await this.db.query(
                "UPDATE user_content SET hero_updated_at = NOW(), hero_collection = $2, hero_title = $3, hero_subtitle = $4, hero_updated = $5, hero_url_image = $6 WHERE ID = $1 RETURNING *;",
                [
                    id,
                    heroCollection,
                    heroTitle,
                    heroSubTitle,
                    updated,
                    imageUrl,
                ]
            );
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async getUserFooter(id) {
        try {
            const result = await this.db.query("SELECT footer_title, footer_location, footer_schedule, footer_url_image, footer_updated, footer_updated_at FROM user_content WHERE id = $1;", [id]);
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async updateUserFooter({ id, title, location, schedule, updated, imageUrl }) {
        try {
            const result = await this.db.query(
                "UPDATE user_content SET footer_updated_at = NOW(), footer_title = $2, footer_location = $3, footer_schedule = $4, footer_updated = $5, footer_url_image = $6 WHERE id = $1 RETURNING *;",
                [
                    id,
                    title,
                    location,
                    schedule,
                    updated,
                    imageUrl,
                ]
            );
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async getUserContent() {
        try {
            const result = await this.db.query(`
                SELECT discount_is_active, 
                discount, 
                discount_description, 
                discount_updated_at, 
                shipping_price, 
                shipping_price_updated_at, 
                shipping_price_update 
                FROM user_content WHERE id = 1;
                `);
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async getDiscountVersion() {
        try {
            const result = await this.db.query("SELECT discount_updated_at FROM user_content WHERE id = 1;");
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async updateUserContent({ discountIsActive, discount, discountDescription, discountUpdatedAt, shippingPrice, shippingUpdatedAt, shippingUpdate }) {
        try {
            const result = await this.db.query(
                `UPDATE user_content
                  SET
                  discount_is_active = $1,
                  discount = $2,
                  discount_description = $3,
                  discount_updated_at = $4,
                  shipping_price = $5,
                  shipping_price_updated_at = $6,
                  shipping_price_update = $7
                  WHERE id = 1
                  RETURNING *;`,
                [
                    discountIsActive,
                    discount,
                    discountDescription,
                    discountUpdatedAt,
                    shippingPrice,
                    shippingUpdatedAt,
                    shippingUpdate
                ]
            );
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async getShippingPrice(id = 1) {
        try {
            const result = await this.db.query("SELECT shipping_price FROM user_content WHERE id = $1;", [id]);
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async getUserContent_V2(id) {
        try {
            const result = await this.db.query("SELECT * FROM user_content_v2 WHERE id = $1;", [id]);
            const userContent_V2 = this.getFirstRow(result);
            return userContent_V2;
        } catch (error) {
            throw error;
        }
    }

    async getUserHeroContent_V2(id) {
        try {
            const result = await this.db.query("SELECT hero FROM user_content_v2 WHERE id = $1;", [id]);
            const userHeroContent_V2 = this.getFirstRow(result);
            return userHeroContent_V2;
        } catch (error) {
            throw error;
        }
    }

    async updateHeroContent_V2(id, heroCollection, heroTitle, heroSubTitle, heroImage, heroUpdated) {
        try {
            const result = await this.db.query(
                `UPDATE public.user_content_v2
                    SET hero = hero || jsonb_build_object(
                    'collection': $2:.text,
                    'title', $3::text,
                    'subtitle', $4::text,
                    'image', $5::text,
                    'updated', $6::boolean,
                    'updated_at', NOW()
                    )
                    WHERE id = $1
                    RETURNING *;
                    `,
                [id, heroCollection, heroTitle, heroSubTitle, heroImage, heroUpdated]
            );
            const userHeroContent = this.getFirstRow(result);
            return userHeroContent;
        } catch (error) {
            throw error;
        }
    }

    async getUserFooterContent_V2(id) {
        try {
            const result = await this.db.query("SELECT footer FROM user_content_v2 WHERE id = $1;", [id]);
            const userFooterContent_V2 = this.getFirstRow(result);
            return userFooterContent_V2;
        } catch (error) {
            throw error;
        }
    }

    async updateFooterContent_V2(id, footerTitle, footerLocation, footerSchedule, footerImage, footerUpdated) {
        try {
            const result = await this.db.query(
                `UPDATE public.user_content_v2
                    SET footer = footer || jsonb_build_object(
                    'title': $2:.text,
                    'location', $3::text,
                    'schedule', $4::text,
                    'image', $5::text,
                    'updated', $6::boolean,
                    'updated_at', NOW()
                    )
                    WHERE id = $1
                    RETURNING *;
                    `,
                [id, footerTitle, footerLocation, footerSchedule, footerImage, footerUpdated]
            );
            const footerContent = this.getFirstRow(result);
            return footerContent;
        } catch (error) {
            throw error;
        }
    }
}