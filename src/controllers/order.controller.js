export class OrderController {
  constructor({ orderModel }) {
    this.orderModel = orderModel;
  }

  getAllOrders = async (req, res) => {
    try {
      const orders = await this.orderModel.getAllOrders();
      if (orders.length === 0) {
        return res.status(400).json({ message: "No hay órdenes" });
      }
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener las órdenes" });
    }
  };

  getOrderById = async (req, res) => {
    const { order_id } = req.params;
    try {
      const order = this.orderModel.getOrderById(order_id);
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener la orden" });
    }
  };

  getUserOrders = async (req, res) => {
    try {
      const { user_id } = req.params;
      const orders = await this.orderModel.getUserOrders(user_id);
      if (orders.length === 0) {
        return res
          .status(400)
          .json({ message: "Este usuario no ha generado órdenes aún" });
      }
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await this.orderModel.getOrderDetails(order.id);
          return {
            ...order,
            items,
          };
        })
      );

      res.status(200).json(ordersWithItems);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener las órdenes: " + error });
    }
  };

  getOrderDetails = async (req, res) => {
    try {
      const { user_id } = req.params;
      const orders = await this.orderModel.getOrdersDetails(user_id);
      if (orders.length === 0) {
        return res.status(400).json({ message: "No hay ítems" });
      }

      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener las órdenes" });
    }
  };

  createOrder = async (req, res) => {
    try {
      const { user_id, items, total, payment_id } = req.body;

      if (!user_id || !items?.length) {
        return res
          .status(400)
          .json({ error: "Datos incompletos para crear la orden" });
      }

      const order = await this.orderModel.createOrder({
        user_id,
        total,
        items,
        payment_id,
      });

      res.status(201).json({
        message: "Orden creada correctamente",
        order_id: order.order_id,
      });
    } catch (error) {
      res.status(500).json({ error: "Error interno al crear la orden: " + error });
    }
  };

  updateOrderStatus = async (req, res) => {
    try {
      const { order_id } = req.params;
      const { status } = req.body;

      if (!status)
        return res.status(400).json({ error: "Estado no proporcionado" });

      await this.orderModel.updateStatus(order_id, status);
      res.status(200).json({ message: "Estado actualizado correctamente" });
    } catch (error) {
      res.status(500).json({ error: "Error interno: " + error });
    }
  };

  deleteOrder = async (req, res) => {
     try {
      const { order_id } = req.params;

      if (!order_id)
        return res.status(400).json({ error: "ID no proporcionado" });

      const result = await this.orderModel.deleteOrderId(order_id);
      res.status(200).json({ message: "Se ha borrado la orden.", result });
    } catch (error) {
      res.status(500).json({ error: "Error interno: " + error });
    }
  }
}
