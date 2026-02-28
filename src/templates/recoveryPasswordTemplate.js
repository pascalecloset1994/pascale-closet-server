export const recoveryPasswordTemplate = ({ userName, resetUrl }) => `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Recuperar Contraseña - Pascale Clothes</title>
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
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 600;
        letter-spacing: 3px;
        text-transform: uppercase;
        color: #FFFFFF;
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
        text-align: center;
        background: #FFFFFF;
      }
      .content h2 {
        font-size: 22px;
        color: #2C2420;
        margin-bottom: 16px;
        font-weight: 600;
      }
      .content p {
        font-size: 15px;
        color: #5C4D3C;
        line-height: 1.8;
        margin: 12px 0;
      }
      .icon-lock {
        margin: 20px 0;
        font-size: 40px;
      }
      .info-box {
        background: #FAF8F5;
        border: 1px solid #E0D6CC;
        border-radius: 8px;
        padding: 20px;
        margin: 24px 0;
        text-align: left;
      }
      .info-box p {
        margin: 6px 0;
        font-size: 13px;
        color: #5C4D3C;
        line-height: 1.6;
      }
      .info-box .icon-item {
        margin: 4px 0;
      }
      .button {
        display: inline-block;
        background: #8B7355;
        color: #FFFFFF !important;
        text-decoration: none;
        padding: 14px 32px;
        border-radius: 8px;
        font-weight: 600;
        margin-top: 24px;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: 13px;
      }
      .button:hover {
        background: #7A6B5A;
      }
      .divider {
        width: 60%;
        height: 1px;
        background: linear-gradient(90deg, transparent, #E0D6CC, transparent);
        margin: 30px auto;
      }
      .url-fallback {
        word-break: break-all;
        font-size: 12px;
        color: #8B7355;
        background: #FAF8F5;
        padding: 12px 16px;
        border-radius: 6px;
        border: 1px dashed #E0D6CC;
        margin: 16px 0;
        display: block;
        text-decoration: none;
      }
      .badge {
        display: inline-block;
        background: #FFF3E0;
        color: #B8860B;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        margin-bottom: 16px;
        border: 1px solid #E0D6CC;
      }
      .highlight {
        color: #8B7355;
        font-weight: 600;
      }
      .footer {
        background: #F5F0EB;
        text-align: center;
        font-size: 12px;
        color: #7A6B5A;
        padding: 24px 15px;
        border-top: 1px solid #E0D6CC;
      }
      @media (prefers-color-scheme: dark) {
        body {
          background: #2C2420;
        }
        .container {
          background: #3a3230;
          border: 1px solid #5C4D3C;
        }
        .content {
          background: #3a3230;
        }
        .content h2 {
          color: #E8DED0;
        }
        .content p {
          color: #C9B8A8;
        }
        .info-box {
          background: #2C2420;
          border-color: #5C4D3C;
        }
        .info-box p {
          color: #C9B8A8;
        }
        .url-fallback {
          background: #2C2420;
          border-color: #5C4D3C;
        }
        .footer {
          background: #2C2420;
          border-color: #5C4D3C;
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
              <div class="icon-lock">🔐</div>
              <span class="badge">Recuperación de Cuenta</span>
              <h2>Hola, ${userName}</h2>
              <p>
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en
                <span class="highlight">Pascale Clothes</span>.
              </p>
              <p>
                Haz clic en el botón de abajo para crear una nueva contraseña.
                Este enlace expirará en <strong>15 minutos</strong>.
              </p>
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
              <div class="divider"></div>
              <p style="font-size: 13px; color: #7A6B5A;">
                Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
              </p>
              <a href="${resetUrl}" class="url-fallback">${resetUrl}</a>
              <div class="info-box">
                <p class="icon-item">🔒 Este enlace es de un solo uso y expira en 15 minutos.</p>
                <p class="icon-item">⚠️ Si no solicitaste este cambio, ignora este correo. Tu contraseña no será modificada.</p>
                <p class="icon-item">🛡️ Nunca compartas este enlace con nadie.</p>
              </div>
              <p style="font-size: 12px; color: #7A6B5A;">
                Si necesitas ayuda, contáctanos respondiendo a este correo.
              </p>
            </div>
            <div class="footer">
              © 2026 Pascale Clothes · Santiago, Chile<br />
              Este es un correo automático, por favor no respondas directamente.
            </div>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
