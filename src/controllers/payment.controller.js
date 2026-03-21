import crypto from "crypto";
import { Preference, Payment } from "mercadopago";
import { mpClient } from "../services/mercadoPago.service.js";
import { sendOrderEmail, sendSellerOrderEmail } from "../services/mail.service.js";
import { neonDB } from "../config/dbConfig.js";
import { request, response } from "express";

const GET_USER_BY_ID = "SELECT * FROM users WHERE user_id = $1;";

export class PaymentController {
  constructor({ orderModel, paymentModel, db }) {
    this.orderModel = orderModel;
    this.paymentModel = paymentModel;
    this.db = db;
  }

  createPreference = async (req = request, res = response) => {
    try {
      const userId = req.userId
      const { items, total, shipping } = req.body;

      // Primero creamos la orden en nuestra DB
      const order = await this.orderModel.createOrder({
        user_id: userId,
        total,
        items,
        payment_id: null,
        shipping: shipping || null,
      });

      const body = {
        items: items.map((p) => ({
          title: p.name,
          quantity: p.quantity,
          currency_id: "ARS",
          unit_price: Number(p.price),
        })),
        back_urls: {
          success: `${process.env.FRONT_URL}/order-confirmation/${order.order_id}`,
          failure: `${process.env.FRONT_URL}/failure`,
          pending: `${process.env.FRONT_URL}/pending`,
        },
        auto_return: "approved",
        metadata: {
          order_id: order.order_id,
          user_id: userId
        },
        // Importante: agregar notification_url para recibir webhooks
        // El parámetro source_news=webhooks asegura que solo recibas webhooks, no IPN
        notification_url: `${process.env.BACK_URL}/payment/webhook?source_news=webhooks`,
      };

      const preference = new Preference(mpClient);
      const result = await preference.create({
        body,
        requestOptions: { idempotencyKey: crypto.randomUUID() },
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

      // ── Validación de firma x-signature de Mercado Pago ──
      const xSignature = req.headers["x-signature"];
      const xRequestId = req.headers["x-request-id"];
      const webhookSecret = process.env.MP_WEBHOOK_SECRET;

      if (webhookSecret && xSignature && xRequestId) {
        // Parsear ts y v1 del header x-signature
        // Formato: "ts=1234567890,v1=abc123..."
        const parts = {};
        xSignature.split(",").forEach((part) => {
          const [key, ...valueParts] = part.trim().split("=");
          parts[key] = valueParts.join("=");
        });

        const ts = parts["ts"];
        const v1 = parts["v1"];

        // Construir el template para validar
        // Formato: "id:<data.id>;request-id:<x-request-id>;ts:<ts>;"
        const dataId = data?.id;
        let manifest = "";
        if (dataId) manifest += `id:${dataId};`;
        manifest += `request-id:${xRequestId};ts:${ts};`;

        // Generar HMAC-SHA256 con el secret
        const hmac = crypto.createHmac("sha256", webhookSecret);
        hmac.update(manifest);
        const generatedHash = hmac.digest("hex");

        if (generatedHash !== v1) {
          console.warn("⚠️ Firma de webhook inválida. Posible intento de suplantación.");
          await this.db.query("INSERT INTO webhook_logs (logs) VALUES ($1);", [
            JSON.stringify({ error: "Firma inválida", xSignature, xRequestId, manifest }, null, 2),
          ]);
          return res.sendStatus(401);
        }

        console.log("✅ Firma de webhook validada correctamente");
      } else if (!webhookSecret) {
        console.warn("⚠️ MP_WEBHOOK_SECRET no configurado. Saltando validación de firma.");
      }

      await this.db.query("INSERT INTO webhook_logs (logs) VALUES ($1);", [JSON.stringify(req.body, null, 2)])

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

      await this.db.query("INSERT INTO webhook_logs (logs) VALUES ($1);", [JSON.stringify({
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
        await this.db.query("INSERT INTO webhook_logs (logs) VALUES ($1);", [`📦 Procesando orden ${order_id} con estado: ${status}`])

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

                // Descontar stock de cada producto
                for (const item of items) {
                  const productId = item.product_id;
                  const quantity = item.quantity || 1;
                  await this.db.query(
                    "UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2 AND stock >= $1;",
                    [quantity, productId]
                  );
                }

                // Los datos de envío ya están en la orden (guardados al crear desde el checkout)
                // Usamos user solo como fallback para email/nombre si la orden no tiene buyer_*
                const buyerName = order.buyer_name || (user ? `${user.name} ${user.lastname}` : null);
                const buyerEmail = order.buyer_email || user?.email;
                const buyerPhone = order.buyer_phone || user?.phone || null;
                const buyerAddress = order.buyer_address || user?.address || null;
                const buyerCity = order.buyer_city || user?.city || null;

                if (buyerEmail) {
                  await sendOrderEmail({
                    to: buyerEmail,
                    userName: buyerName,
                    orderId: order_id,
                    items: items,
                    total: order.total,
                    orderDate: new Date().toLocaleDateString("es-CL"),
                    address: buyerAddress,
                    city: buyerCity
                  });
                  await neonDB.query("INSERT INTO webhook_logs (details) VALUES($1);", [JSON.stringify("📧 Email de confirmación enviado a: " + buyerEmail)]);

                  // Notificar al vendedor
                  await sendSellerOrderEmail({
                    buyerName,
                    buyerEmail,
                    buyerPhone,
                    orderId: order_id,
                    orderNumber: order.order_number || null,
                    items,
                    total: order.total,
                    orderDate: new Date().toLocaleDateString("es-CL"),
                    paymentMethod: paymentData.payment_method_id,
                    paymentId: String(paymentData.id),
                    address: buyerAddress,
                    city: buyerCity,
                  });
                  await neonDB.query("INSERT INTO webhook_logs (details) VALUES($1);", [JSON.stringify("📧 Email de nueva venta enviado al vendedor")]);
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
          "INSERT INTO webhook_logs (error, details, created_at) VALUES ($1, $2, NOW());",
          [error.message || String(error), JSON.stringify(req.body)]
        );
      } catch (dbError) {
        console.error("Error guardando en webhook_logs:", dbError);
      }

      // Devolver 200 para que MP no reintente, pero el error ya se guardó
      res.sendStatus(200);
    }
  };
}
