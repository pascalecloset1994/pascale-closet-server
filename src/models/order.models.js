export class OrderModel {
  constructor(db) {
    this.db = db;
  }

  async getAllOrders() {
    try {
      const orders = await this.db.query("SELECT * FROM orders;");
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
        JOIN e_retro_products p ON oi.product_id = p.id
        WHERE oi.order_id = $1;
        `,
        [order_id],
      );
      return orders;
    } catch (error) {
      throw error;
    }
  }

  async createOrder({ user_id, total, items, payment_id }) {
    try {
      await this.db.query("BEGIN");

      const insertOrder = `
          INSERT INTO orders (user_id, total, payment_id, order_number)
          VALUES ($1, $2, $3, $4)
          RETURNING id;
        `;
      const result = await this.db.query(insertOrder, [
        user_id,
        total,
        payment_id,
        this.generateOrderNumber(),
      ]);

      const orderId = result[0].id;

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
