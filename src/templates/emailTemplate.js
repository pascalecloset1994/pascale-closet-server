export const emailTemplate = ({ userName, url }) => `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bienvenido a Pascale Clothes</title>
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
      .fashion-icons {
        margin: 25px 0;
        font-size: 24px;
        letter-spacing: 12px;
        color: #C9B8A8;
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
      .badge {
        display: inline-block;
        background: #F5F0EB;
        color: #8B7355;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        margin-top: 8px;
        border: 1px solid #E0D6CC;
      }
      .location-box {
        background: #FAF8F5;
        border: 1px solid #E0D6CC;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }
      .location-box strong {
        color: #8B7355;
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
        .location-box {
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
              <h2>¡Bienvenida, ${userName}!</h2>
              <p>
                Nos emociona tenerte en <span class="highlight">Pascale Clothes</span>, 
                tu tienda de moda con las últimas tendencias y el mejor estilo.
              </p>
              <div class="fashion-icons">✦ ✦ ✦</div>
              <p>
                Descubre nuestra colección exclusiva de ropa, accesorios y mucho más.
                Cada prenda está seleccionada con amor para que luzcas increíble.
              </p>
              <div class="location-box">
                <strong>📍 Encuéntranos en:</strong><br/>
                <p>
                Mall Costanera Center<br/>
                Piso PB, Frente a Sally Beauty<br/>
                Lunes a Sábados de 10:00 a 21:00
                </p>
              </div>
              <span class="badge">Nueva Colección</span>
              <br/>
              <a href="${url}" class="button">Ver Colección</a>
              <div class="divider"></div>
              <p style="font-size: 12px; color: #7A6B5A">
                Si no creaste esta cuenta, puedes ignorar este correo.
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
