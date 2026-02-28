import { Preference, Payment } from "mercadopago";
import { mpClient } from "../services/mercadoPago.service.js";
import { sendOrderEmail, sendSellerOrderEmail } from "../services/mail.service.js";
import { GET_USER_BY_ID } from "./constants.js";

export class PaymentController {
  constructor({ orderModel, paymentModel, db }) {
    this.orderModel = orderModel;
    this.paymentModel = paymentModel;
    this.db = db;
  }

  createPreference = async (req, res) => {
    try {
      const { user_id, items, total } = req.body;

      // Primero creamos la orden en nuestra DB
      const order = await this.orderModel.createOrder({
        user_id,
        total,
        items,
        payment_id: null,
      });

      const body = {
        items: items.map((p) => ({
          title: p.name,
          quantity: p.quantity,
          currency_id: "ARS",
          unit_price: Number(p.price),
        })),
        payer: { id: user_id },
        back_urls: {
          success: `${process.env.FRONT_URL}/order-confirmation/${order.order_id}`,
          failure: `${process.env.FRONT_URL}/failure`,
        },
        auto_return: "approved",
        metadata: { 
          order_id: order.order_id,
          user_id: user_id 
        },
        // Importante: agregar notification_url para recibir webhooks
        // El parámetro source_news=webhooks asegura que solo recibas webhooks, no IPN
        notification_url: `${process.env.BACKEND_URL}/payment/webhook?source_news=webhooks`,
      };

      const preference = new Preference(mpClient);
      const result = await preference.create({
        body,
        requestOptions: { idempotencyKey: user_id },
      });

      res.json({
        init_point: result.init_point,
        order_id: order.order_id,
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "No se pudo crear la preferencia: " + error });
    }
  };

  // Webhook de Mercado Pago
  webhook = async (req, res) => {
    try {
      const { type, data, action } = req.body;

      await this.db.query("INSERT INTO webhook_errors (logs) VALUES ($1);", [JSON.stringify(req.body, null, 2)])

      // Validar que sea una notificación de pago
      // Mercado Pago puede enviar: "payment", "payment.created", "payment.updated"
      const isPaymentNotification =
        type === "payment" ||
        action === "payment.created" ||
        action === "payment.updated";

      if (!isPaymentNotification) {
        console.log("⏭️ Notificación ignorada, tipo:", type, "action:", action);
        return res.sendStatus(200);
      }

      // Obtener el ID del pago - puede venir como string o número
      const paymentId = data?.id ? String(data.id) : null;
      if (!paymentId) {
        console.warn("⚠️ No se recibió payment ID");
        return res.sendStatus(400);
      }

      console.log("🔍 Consultando pago a MP con ID:", paymentId);

      // Consultar los detalles del pago a Mercado Pago
      const paymentClient = new Payment(mpClient);
      const paymentData = await paymentClient.get({ id: paymentId });

      await this.db.query("INSERT INTO webhook_errors (logs) VALUES ($1);", [JSON.stringify({
        title: "💳 Datos del pago recibidos:",
        id: paymentData.id,
        status: paymentData.status,
        status_detail: paymentData.status_detail,
        metadata: paymentData.metadata,
        external_reference: paymentData.external_reference,
        transaction_amount: paymentData.transaction_amount,
      }, null, 2)])

      const status = paymentData.status;
      const order_id = paymentData.metadata?.order_id;

      // Actualizar la orden según el estado
      if (order_id) {
        await this.db.query("INSERT INTO webhook_errors (logs) VALUES ($1);", [`📦 Procesando orden ${order_id} con estado: ${status}`])

        switch (status) {
          case "approved":
            await this.orderModel.updateStatus(order_id, "approved");
            await this.orderModel.updatePaymentId(order_id, String(paymentId));

            // Pasar los datos correctos del pago al modelo
            await this.paymentModel.createOrUpdate({
              id: String(paymentData.id),
              order_id: String(order_id),
              user_id: paymentData.metadata?.user_id || null,
              status: paymentData.status,
              transaction_amount: paymentData.transaction_amount,
              currency_id: paymentData.currency_id,
              payment_method_id: paymentData.payment_method_id,
              payer: paymentData.payer,
            });

            console.log("✅ Orden actualizada a approved y pago registrado");

            // Enviar correo de confirmación
            try {
              const orderResult = await this.orderModel.getOrderById(order_id);
              const order = orderResult?.rows?.[0] || orderResult?.[0];

              if (order) {
                const userResult = await this.db.query(GET_USER_BY_ID, [order.user_id]);
                const user = userResult?.rows?.[0] || userResult?.[0];

                const itemsResult = await this.orderModel.getOrderDetails(order_id);
                const items = itemsResult?.rows || itemsResult;

                if (user) {
                  await sendOrderEmail({
                    to: user.email,
                    userName: `${user.name} ${user.lastname}`,
                    orderId: order_id,
                    items: items,
                    total: order.total,
                    orderDate: new Date().toLocaleDateString("es-CL"),
                    address: user.address,
                    city: user.city
                  });
                  console.log("📧 Email de confirmación enviado a:", user.email);

                  // Notificar al vendedor
                  await sendSellerOrderEmail({
                    buyerName: `${user.name} ${user.lastname}`,
                    buyerEmail: user.email,
                    buyerPhone: user.phone || null,
                    orderId: order_id,
                    orderNumber: order.order_number || null,
                    items,
                    total: order.total,
                    orderDate: new Date().toLocaleDateString("es-CL"),
                    paymentMethod: paymentData.payment_method_id,
                    paymentId: String(paymentData.id),
                    address: user.address || null,
                    city: user.city || null,
                  });
                  console.log("📧 Email de nueva venta enviado al vendedor");
                }
              }
            } catch (emailError) {
              console.error("Error enviando email de confirmación:", emailError);
            }
            break;

          case "pending":
          case "in_process":
          case "authorized":
            await this.orderModel.updateStatus(order_id, "pending");
            console.log("⏳ Orden actualizada a pending");
            break;

          case "rejected":
          case "cancelled":
          case "refunded":
          case "charged_back":
            await this.orderModel.updateStatus(order_id, "cancelled");
            console.log("❌ Orden actualizada a cancelled");
            break;

          default:
            console.log("⚠️ Estado no manejado:", status);
        }
      } else {
        console.warn("⚠️ No se encontró order_id en metadata:", JSON.stringify(paymentData.metadata));
      }

      res.sendStatus(200);
    } catch (error) {
      console.error("❌ Error en webhook:", error.message || error);
      
      // Guardar error para debug
      try {
        await this.db.query(
          "INSERT INTO webhook_errors (error, details, created_at) VALUES ($1, $2, NOW());",
          [error.message || String(error), JSON.stringify(req.body)]
        );
      } catch (dbError) {
        console.error("Error guardando en webhook_errors:", dbError);
      }
      
      // Devolver 200 para que MP no reintente, pero el error ya se guardó
      res.sendStatus(200);
    }
  };
}
