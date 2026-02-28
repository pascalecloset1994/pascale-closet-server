export const sellerOrderEmailTemplate = ({
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
}) => `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nueva Venta - Pascale Clothes</title>
  </head>
  <body style="margin:0; padding:0; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; background-color:#F7F5F2; color:#2C2420;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F5F2; padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="580" cellpadding="0" cellspacing="0" style="background:#FFFFFF; border-radius:8px; overflow:hidden; box-shadow:0 1px 4px rgba(44,36,32,0.08); border:1px solid #E8E0D8;">
            
            <!-- Header -->
            <tr>
              <td style="background:#8B7355; padding:28px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <span style="font-size:18px; font-weight:600; color:#FFFFFF; letter-spacing:2px; text-transform:uppercase;">Pascale Clothes</span>
                    </td>
                    <td align="right">
                      <span style="display:inline-block; background:rgba(255,255,255,0.2); color:#FFFFFF; padding:5px 14px; border-radius:4px; font-size:11px; font-weight:600; letter-spacing:1px; text-transform:uppercase;">🔔 Nueva Venta</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Alert Banner -->
            <tr>
              <td style="background:#F0EBE4; padding:16px 32px; border-bottom:1px solid #E8E0D8;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:14px; color:#5C4D3C;">
                      <strong style="color:#8B7355;">Orden #${orderId}</strong>${orderNumber ? ` · ${orderNumber}` : ""}
                    </td>
                    <td align="right" style="font-size:13px; color:#7A6B5A;">
                      ${orderDate}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:28px 32px 0 32px;">
                
                <!-- Cliente -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                  <tr>
                    <td style="font-size:11px; font-weight:600; color:#8B7355; text-transform:uppercase; letter-spacing:1.5px; padding-bottom:10px; border-bottom:2px solid #8B7355;">
                      Datos del Cliente
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:14px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="50%" style="padding:4px 0; vertical-align:top;">
                            <span style="font-size:11px; color:#7A6B5A; text-transform:uppercase; letter-spacing:0.5px;">Nombre</span><br/>
                            <span style="font-size:14px; color:#2C2420; font-weight:500;">${buyerName}</span>
                          </td>
                          <td width="50%" style="padding:4px 0; vertical-align:top;">
                            <span style="font-size:11px; color:#7A6B5A; text-transform:uppercase; letter-spacing:0.5px;">Email</span><br/>
                            <a href="mailto:${buyerEmail}" style="font-size:14px; color:#8B7355; text-decoration:none; font-weight:500;">${buyerEmail}</a>
                          </td>
                        </tr>
                        ${buyerPhone ? `
                        <tr>
                          <td colspan="2" style="padding:8px 0 0 0;">
                            <span style="font-size:11px; color:#7A6B5A; text-transform:uppercase; letter-spacing:0.5px;">Teléfono</span><br/>
                            <span style="font-size:14px; color:#2C2420; font-weight:500;">${buyerPhone}</span>
                          </td>
                        </tr>
                        ` : ""}
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Dirección de envío -->
                ${address ? `
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                  <tr>
                    <td style="font-size:11px; font-weight:600; color:#8B7355; text-transform:uppercase; letter-spacing:1.5px; padding-bottom:10px; border-bottom:2px solid #8B7355;">
                      Dirección de Envío
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:14px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F5; border-radius:6px; border:1px solid #E8E0D8;">
                        <tr>
                          <td style="padding:14px 16px;">
                            <span style="font-size:14px; color:#2C2420; line-height:1.6;">
                              📍 ${address}${city ? `, ${city}` : ""}
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                ` : `
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                  <tr>
                    <td style="font-size:11px; font-weight:600; color:#8B7355; text-transform:uppercase; letter-spacing:1.5px; padding-bottom:10px; border-bottom:2px solid #8B7355;">
                      Modalidad de Entrega
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:14px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F5; border-radius:6px; border:1px solid #E8E0D8;">
                        <tr>
                          <td style="padding:14px 16px;">
                            <span style="font-size:14px; color:#2C2420;">🏪 Retiro en tienda</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                `}

                <!-- Productos -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
                  <tr>
                    <td style="font-size:11px; font-weight:600; color:#8B7355; text-transform:uppercase; letter-spacing:1.5px; padding-bottom:10px; border-bottom:2px solid #8B7355;">
                      Productos (${items.reduce((sum, i) => sum + Number(i.quantity), 0)} ítems)
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <!-- Table Header -->
                  <tr>
                    <td style="padding:10px 0; font-size:10px; font-weight:600; color:#7A6B5A; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid #E8E0D8;">Producto</td>
                    <td align="center" style="padding:10px 0; font-size:10px; font-weight:600; color:#7A6B5A; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid #E8E0D8;" width="60">Cant.</td>
                    <td align="right" style="padding:10px 0; font-size:10px; font-weight:600; color:#7A6B5A; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid #E8E0D8;" width="90">Precio</td>
                    <td align="right" style="padding:10px 0; font-size:10px; font-weight:600; color:#7A6B5A; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid #E8E0D8;" width="100">Subtotal</td>
                  </tr>
                  <!-- Items -->
                  ${items
                    .map(
                      (item) => `
                  <tr>
                    <td style="padding:12px 0; font-size:13px; color:#2C2420; font-weight:500; border-bottom:1px solid #F0EBE4;">${item.product_name || item.name}</td>
                    <td align="center" style="padding:12px 0; font-size:13px; color:#5C4D3C; border-bottom:1px solid #F0EBE4;">${item.quantity}</td>
                    <td align="right" style="padding:12px 0; font-size:13px; color:#5C4D3C; border-bottom:1px solid #F0EBE4;">$${Number(item.price).toLocaleString("es-CL")}</td>
                    <td align="right" style="padding:12px 0; font-size:13px; color:#2C2420; font-weight:500; border-bottom:1px solid #F0EBE4;">$${(Number(item.price) * Number(item.quantity)).toLocaleString("es-CL")}</td>
                  </tr>`,
                    )
                    .join("")}
                </table>

                <!-- Total -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 28px 0;">
                  <tr>
                    <td style="background:#8B7355; border-radius:6px; padding:18px 20px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <span style="font-size:11px; color:#D4C8B8; text-transform:uppercase; letter-spacing:1.5px; font-weight:500;">Total de la venta</span>
                          </td>
                          <td align="right">
                            <span style="font-size:24px; font-weight:600; color:#FFFFFF;">$${Number(total).toLocaleString("es-CL")}</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Pago -->
                ${paymentMethod || paymentId ? `
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                  <tr>
                    <td style="font-size:11px; font-weight:600; color:#8B7355; text-transform:uppercase; letter-spacing:1.5px; padding-bottom:10px; border-bottom:2px solid #8B7355;">
                      Información del Pago
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:14px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        ${paymentMethod ? `
                        <tr>
                          <td width="40%" style="padding:4px 0;">
                            <span style="font-size:11px; color:#7A6B5A; text-transform:uppercase; letter-spacing:0.5px;">Método</span><br/>
                            <span style="font-size:14px; color:#2C2420; font-weight:500;">${paymentMethod}</span>
                          </td>
                          <td width="60%" style="padding:4px 0;">
                            <span style="font-size:11px; color:#7A6B5A; text-transform:uppercase; letter-spacing:0.5px;">Estado</span><br/>
                            <span style="display:inline-block; background:#E8F5E9; color:#2E7D32; padding:2px 10px; border-radius:3px; font-size:12px; font-weight:600;">✓ Aprobado</span>
                          </td>
                        </tr>
                        ` : ""}
                        ${paymentId ? `
                        <tr>
                          <td colspan="2" style="padding:8px 0 0 0;">
                            <span style="font-size:11px; color:#7A6B5A; text-transform:uppercase; letter-spacing:0.5px;">ID de Pago (MP)</span><br/>
                            <span style="font-size:13px; color:#5C4D3C; font-family:monospace;">${paymentId}</span>
                          </td>
                        </tr>
                        ` : ""}
                      </table>
                    </td>
                  </tr>
                </table>
                ` : ""}

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#F7F5F2; padding:18px 32px; border-top:1px solid #E8E0D8;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:11px; color:#7A6B5A; line-height:1.6;">
                      Notificación automática · Pascale Clothes © ${new Date().getFullYear()}
                    </td>
                    <td align="right" style="font-size:11px; color:#7A6B5A;">
                      Santiago, Chile
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
