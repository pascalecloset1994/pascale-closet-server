export class ConentModel {
    constructor({ db }) {
        this.db = db;
    }

    async getUserHeroContent() {
        try {
            const query = `
            SELECT hero_collection, 
            hero_title, 
            hero_subtitle, 
            hero_url_image, 
            hero_updated, 
            hero_updated_at 
            FROM user_content WHERE id = 1;
            `
            const result = await this.db.query(query);
            return result;
        } catch (error) {
            throw error;
        }
    }

    async updateHeroContent(id, content) {
        try {
            const query = `
            UPDATE user_content SET 
            hero_updated_at = NOW(), 
            hero_collection = $2, 
            hero_title = $3, 
            hero_subtitle = $4, 
            hero_updated = $5, 
            hero_url_image = $6 
            WHERE id = $1 RETURNING *;
            `
            const result = await this.db.query(query, [
                id,
                content.heroCollection,
                content.heroTitle,
                content.heroSubtitle,
                true,
                content.urlImage
            ]);
            return result;
        } catch (error) {
            throw error;
        }
    }

    async getFooterContent() {
        try {
            const query = `
            SELECT footer_title, footer_location, footer_schedule,
            footer_url_image, footer_updated, footer_updated_at
            FROM user_content WHERE id = 1;
            `
            const result = await this.db.query(query);
            return result;
        } catch (error) {
            throw error;
        }
    }

    async updateFooterContent(id, content) {
        try {
            const query = `
            UPDATE user_content SET
            footer_updated_at = NOW(),
            footer_title = $2,
            footer_location = $3,
            footer_schedule = $4,
            footer_updated = $5,
            footer_url_image = $6
            WHERE id = $1 RETURNING *;
            `
            const result = await this.db.query(query, [
                id,
                content.title,
                content.location,
                content.schedule,
                true,
                content.urlImage,
            ]);
            return result;
        } catch (error) {
            throw error;
        }
    }

    async getDiscountContent() {
        try {
            const query = `
            SELECT discount_is_active, discount, discount_description, discount_updated_at
            FROM user_content WHERE id = 1;
            `
            const result = await this.db.query(query);
            return result;
        } catch (error) {
            throw error;
        }
    }

    async updateDiscountContent(content) {
        try {
            const query = `
            UPDATE user_content SET
            discount_is_active = $1,
            discount = $2,
            discount_description = $3,
            discount_updated_at = $4
            WHERE id = 1 RETURNING *;
            `
            const result = await this.db.query(query, [
                content.discountIsActive,
                content.discount,
                content.discountDescription,
                content.discountUpdatedAt,
            ]);
            return result;
        } catch (error) {
            throw error;
        }
    }
}
