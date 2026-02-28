export const orderEmailTemplate = ({
  userName,
  orderId,
  items,
  total,
  orderDate,
  address,
  city,
}) => `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Orden Confirmada - Pascale Clothes</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: "Inter", "Segoe UI", Arial, sans-serif;
        background-color: #FAF8F5;
        color: #2C2420;
        -webkit-text-size-adjust: none;
      }
      table {
        border-spacing: 0;
        width: 100%;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #FFFFFF;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 24px rgba(44, 36, 32, 0.06);
        border: 1px solid #E0D6CC;
      }
      .header {
        background: linear-gradient(135deg, #8B7355, #A69580);
        color: #FFFFFF;
        text-align: center;
        padding: 40px 20px;
        position: relative;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 600;
        letter-spacing: 3px;
        text-transform: uppercase;
        color: #FFFFFF;
        position: relative;
        z-index: 1;
      }
      .header p {
        margin: 10px 0 0 0;
        font-size: 13px;
        color: #F5F0EB;
        letter-spacing: 2px;
        text-transform: uppercase;
        font-weight: 400;
      }
      .content {
        padding: 40px 35px;
        background: #FFFFFF;
      }
      .content h2 {
        font-size: 22px;
        color: #2C2420;
        margin-bottom: 16px;
        font-weight: 600;
        text-align: center;
      }
      .content p {
        font-size: 15px;
        color: #5C4D3C;
        line-height: 1.8;
        margin: 12px 0;
        text-align: center;
      }
      .order-info {
        background: #F5F0EB;
        border: 1px solid #E0D6CC;
        border-radius: 8px;
        padding: 20px;
        margin: 25px 0;
      }
      .order-info-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #E0D6CC;
      }
      .order-info-row:last-child {
        border-bottom: none;
      }
      .order-info-label {
        font-weight: 600;
        color: #8B7355;
      }
      .order-info-value {
        color: #5C4D3C;
      }
      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin: 25px 0;
      }
      .items-table th {
        background: #8B7355;
        color: #FFFFFF;
        padding: 12px;
        text-align: left;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .items-table td {
        padding: 15px 12px;
        border-bottom: 1px solid #E0D6CC;
        color: #5C4D3C;
      }
      .items-table tr:last-child td {
        border-bottom: 2px solid #8B7355;
      }
      .item-name {
        font-weight: 600;
        color: #2C2420;
      }
      .total-section {
        background: #8B7355;
        color: #FFFFFF;
        padding: 20px;
        border-radius: 8px;
        margin: 25px 0;
        text-align: center;
      }
      .total-label {
        font-size: 14px;
        color: #E8DED0;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 8px;
      }
      .total-amount {
        font-size: 32px;
        font-weight: 600;
        color: #FFFFFF;
      }
      .status-badge {
        display: inline-block;
        background: #F5F0EB;
        color: #8B7355;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        margin: 15px 0;
        border: 1px solid #E0D6CC;
      }
      .divider {
        width: 60%;
        height: 1px;
        background: linear-gradient(90deg, transparent, #E0D6CC, transparent);
        margin: 30px auto;
      }
      .footer {
        background: #F5F0EB;
        text-align: center;
        font-size: 12px;
        color: #7A6B5A;
        padding: 24px 15px;
        border-top: 1px solid #E0D6CC;
      }
      .highlight {
        color: #8B7355;
        font-weight: 600;
      }
      .info-box {
        background: #FAF8F5;
        border-left: 4px solid #8B7355;
        padding: 15px;
        margin: 20px 0;
        border-radius: 4px;
        border: 1px solid #E0D6CC;
        border-left-width: 4px; /* reinforces left border */
      }
      .info-box p {
        margin: 8px 0;
        font-size: 14px;
        text-align: left;
        color: #5C4D3C;
      }
      @media (prefers-color-scheme: dark) {
        body {
          background: #2C2420;
        }
        .container {
          background: #3a3230;
          border: 1px solid #5C4D3C;
        }
        .content h2 {
          color: #E8DED0;
        }
        .content p {
          color: #C9B8A8;
        }
        .order-info {
          background: #2C2420;
          border-color: #5C4D3C;
        }
        .location-box {
          background: #2C2420;
          border-color: #5C4D3C;
        }
        .footer {
          background: #2C2420;
          border-color: #5C4D3C;
          color: #C9B8A8;
        }
        .item-name {
          color: #E8DED0;
        }
        .items-table td {
          color: #C9B8A8;
        }
      }
    </style>
  </head>
  <body>
    <table role="presentation">
      <tr>
        <td align="center">
          <div class="container">
            <div class="header">
              <h1>Pascale Clothes</h1>
              <p>Moda & Estilo en Santiago</p>
            </div>
            <div class="content">
              <h2>¡Orden Confirmada con Éxito!</h2>
              <p>
                Hola <span class="highlight">${userName}</span>, gracias por tu compra.
                Hemos recibido tu orden y ya la estamos preparando.
              </p>
              
              <span class="status-badge">✅ Pago Aprobado</span>

              <div class="order-info">
                <div class="order-info-row">
                  <span class="order-info-label">Número de Orden:</span>
                  <span class="order-info-value">#${orderId}</span>
                </div>
                <div class="order-info-row">
                  <span class="order-info-label">Fecha:</span>
                  <span class="order-info-value">${orderDate}</span>
                </div>
              </div>

              <h3 style="color: #8B7355; font-size: 18px; margin: 30px 0 15px 0; text-align: center;">
                Detalle de tu Compra
              </h3>

              <table class="items-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th style="text-align: center;">Cant.</th>
                    <th style="text-align: right;">Precio</th>
                    <th style="text-align: right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${items
                    .map(
                      (item) => `
                    <tr>
                      <td class="item-name">${item.product_name || item.name}</td>
                      <td style="text-align: center;">${item.quantity}</td>
                      <td style="text-align: right;">$${Number(
                        item.price,
                      ).toLocaleString("es-CL")}</td>
                      <td style="text-align: right;">$${(
                        Number(item.price) * Number(item.quantity)
                      ).toLocaleString("es-CL")}</td>
                    </tr>
                  `,
                    )
                    .join("")}
                </tbody>
              </table>

              <div class="total-section">
                <div class="total-label">Total Pagado</div>
                <div class="total-amount">$${Number(total).toLocaleString(
                  "es-CL",
                )}</div>
              </div>

              <div class="info-box">
                <p><strong>📍 Retiro en Tienda:</strong></p>
                <p>Mall Costanera Center, Piso PB, Frente a Sally Beauty.</p>
                <p><strong>🚚 Envío a Domicilio:</strong></p>
                <p>Si elegiste envío, te notificaremos cuando salga a reparto.</p>
                <p>Tu dirección: ${address}, ${city}.</p>
              </div>

              <div class="divider"></div>

              <p style="font-size: 12px; color: #7A6B5A">
                Si tienes alguna pregunta sobre tu orden, escríbenos.
              </p>
            </div>
            <div class="footer">
              © 2026 Pascale Clothes · Santiago, Chile<br />
              Hecho con cariño para las amantes de la moda.
            </div>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
