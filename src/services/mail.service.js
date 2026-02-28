import nodemailer from "nodemailer"
import { emailTemplate } from "../templates/emailTemplate.js";
import { orderEmailTemplate } from "../templates/orderEmailTemplate.js";
import { sellerOrderEmailTemplate } from "../templates/sellerOrderEmailTemplate.js";
import { recoveryPasswordTemplate } from "../templates/recoveryPasswordTemplate.js";

export const sendEmail = async ({ to, userName }) => {
    try {
      if (!userName || !to) {
        throw new Error("Faltan los parámetros del usuario");
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const html = emailTemplate({
        userName,
        url: "https://pascale-clothes.vercel.app/products",
      });

      const info = await transporter.sendMail({
        from: `"Pascale Clothes" <${process.env.EMAIL_USER}>`,
        to,
        subject: `Bienvenido a Pascale Clothes ${userName} 👗`,
        html,
      });

      return info;
    } catch (error) {
      throw error;
    }
  };

  export const sendOrderEmail = async ({ to, userName, orderId, items, total, orderDate, pdfBuffer }) => {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      const html = orderEmailTemplate({
        userName,
        orderId,
        items,
        total,
        orderDate,
      });
  
      const mailOptions = {
        from: `"Pascale Clothes" <${process.env.EMAIL_USER}>`,
        to,
        subject: `Confirmación de Orden #${orderId} - Pascale Clothes 👗`,
        html,
        attachments: [],
      };
  
      if (pdfBuffer) {
        mailOptions.attachments.push({
          filename: `invoice-${orderId}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        });
      }
  
      const info = await transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      // No lanzamos el error para no interrumpir el flujo del webhook si falla el correo
    }
  };

  export const sendSellerOrderEmail = async ({
    buyerName,
    buyerEmail,
    buyerPhone,
    orderId,
    orderNumber,
    items,
    total,
    orderDate,
    paymentMethod,
    paymentId,
    address,
    city,
  }) => {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const html = sellerOrderEmailTemplate({
        buyerName,
        buyerEmail,
        buyerPhone,
        orderId,
        orderNumber,
        items,
        total,
        orderDate,
        paymentMethod,
        paymentId,
        address,
        city,
      });

      const info = await transporter.sendMail({
        from: `"Pascale Clothes - Ventas" <${process.env.EMAIL_USER}>`,
        to: process.env.SELLER_EMAIL || process.env.EMAIL_USER,
        subject: `🛒 Nueva Venta #${orderId} · $${Number(total).toLocaleString("es-CL")} - ${buyerName}`,
        html,
      });

      return info;
    } catch (error) {
      console.error("Error enviando email al vendedor:", error);
    }
  };

  export const sendRecoveryPasswordEmail = async ({ to, userName, resetUrl }) => {
    try {
      if (!to || !resetUrl) {
        throw new Error("Faltan parámetros para el email de recuperación");
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const html = recoveryPasswordTemplate({
        userName: userName || "Usuario",
        resetUrl,
      });

      const info = await transporter.sendMail({
        from: `"Pascale Clothes" <${process.env.EMAIL_USER}>`,
        to,
        subject: "🔐 Restablecer tu contraseña - Pascale Clothes",
        html,
      });

      return info;
    } catch (error) {
      console.error("Error enviando email de recuperación:", error);
      throw error;
    }
  };