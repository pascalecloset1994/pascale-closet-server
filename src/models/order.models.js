export class OrderModel {
  constructor(db) {
    this.db = db;
  }

  async getAllOrders() {
    try {
      const orders = await this.db.query(`
        SELECT 
          o.id,
          o.user_id,
          o.total,
          o.status,
          o.payment_id,
          o.order_number,
          o.created_at,
          o.updated_at,
          COALESCE(o.buyer_name, CONCAT(u.name, ' ', u.lastname)) AS buyer_name,
          COALESCE(o.buyer_email, u.email) AS buyer_email,
          COALESCE(o.buyer_phone, u.phone) AS buyer_phone,
          COALESCE(o.buyer_address, u.address) AS buyer_address,
          COALESCE(o.buyer_city, u.city) AS buyer_city,
          COALESCE(u.country) AS buyer_country,
          COALESCE(u.postal_code) AS buyer_postal_code,
          u.name AS buyer_first_name,
          u.lastname AS buyer_last_name
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.user_id
        ORDER BY o.created_at DESC;
      `);
      return orders;
    } catch (error) {
      throw error;
    }
  }

  async getUserOrders(user_id) {
    try {
      const orders = await this.db.query(
        "SELECT * FROM orders WHERE user_id = $1;",
        [user_id],
      );
      return orders;
    } catch (error) {
      throw error;
    }
  }

  async getOrderById(order_id) {
    try {
      const order = await this.db.query(
        "SELECT * FROM orders WHERE order_id = $1 ORDER BY created_at ASC;",
        [order_id],
      );
      return order;
    } catch (error) {
      throw error;
    }
  }

  async getOrderDetails(order_id) {
    try {
      const orders = await this.db.query(
        `
        SELECT 
        oi.id,
        oi.order_id,
        oi.product_id,
        p.name AS product_name,
        oi.quantity,
        oi.price
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1;
        `,
        [order_id],
      );
      return orders;
    } catch (error) {
      throw error;
    }
  }

  async createOrder({ user_id, total, items, payment_id, shipping }) {
    try {
      await this.db.query("BEGIN");

      const insertOrder = `
          INSERT INTO orders (user_id, total, payment_id, order_number, buyer_name, buyer_email, buyer_phone, buyer_address, buyer_city)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id;
        `;
      const result = await this.db.query(insertOrder, [
        user_id,
        total,
        payment_id,
        this.generateOrderNumber(),
        shipping ? `${shipping.firstName} ${shipping.lastName}` : null,
        shipping?.email || null,
        shipping?.phone || null,
        shipping?.address ? `${shipping.address}, ${shipping.state || ''} ${shipping.zipCode || ''}`.trim() : null,
        shipping?.city || null,
      ]);

      const row = result?.rows?.[0] || result?.[0];
      const orderId = row.id;

      const insertItem = `
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES ($1, $2, $3, $4);
        `;

      for (const item of items) {
        await this.db.query(insertItem, [
          orderId,
          item.id,
          item.quantity,
          item.price,
        ]);
      }

      await this.db.query("COMMIT");
      return { order_id: orderId };
    } catch (error) {
      await this.db.query("ROLLBACK");
      throw error;
    }
  }

  async updateStatus(order_id, status) {
    const query = `
        UPDATE orders SET status = $1, updated_at = now()
        WHERE id = $2;
      `;
    await this.db.query(query, [status, order_id]);
  }

  async updatePaymentId(order_id, payment_id) {
    try {
      const query = `
      UPDATE orders 
      SET payment_id = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *;
    `;
      const result = await this.db.query(query, [payment_id, order_id]);
      return result[0];
    } catch (error) {
      console.error("❌ Error al actualizar payment_id de orden:", error);
      throw error;
    }
  }

  async deleteOrderId(order_id) {
    try {
      const query = `
      DELETE FROM orders
      WHERE id = $1 
      RETURNING *;`;
      const result = await this.db.query(query, [order_id]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  generateOrderNumber() {
    return "RL-" + crypto.randomUUID().split("-")[2];
  }
}
