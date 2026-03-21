export class AuthModel {
    constructor(db) {
        this.db = db;
    }

    getFirstRow = (result) => result?.rows?.[0] || result?.[0];

    async getUserByEmail(email) {
        try {
            const result = await this.db.query("SELECT * FROM users WHERE email = $1;", [
                email,
            ]);
            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async createUser({
        name,
        lastName,
        email,
        password,
        role,
        ip,
        city,
        country,
        postalCode,
    }) {
        try {
            const result = await this.db.query(
                `INSERT INTO users (name, lastname, email, password, role, ip, city, country, postal_code)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (email) DO NOTHING
        RETURNING *;`,
                [name, lastName, email, password, role, ip, city, country, postalCode],
            );

            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }

    async updateUserPassword({ userId, password, updated = true }) {
        try {
            const result = await this.db.query(
                "UPDATE users SET password = $2, updated = $3, updated_at = NOW() WHERE user_id = $1 RETURNING *;",
                [userId, password, updated],
            );

            return this.getFirstRow(result);
        } catch (error) {
            throw error;
        }
    }
}
