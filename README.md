To develop locally:

**Pascale Server**

Servidor backend para la tienda "Pascale Clothes" — API REST construida con `Express` que ofrece autenticación, gestión de productos, órdenes, integración con MercadoPago, envío de correos y un pequeño asistente de IA vía Cohere.

**Tecnologías principales**
- **Framework**: `Express` (ES Modules).
- **Base de datos**: Neon (`@neondatabase/serverless`).
- **Pagos**: `mercadopago` (webhooks y creación de preferencias).
- **IA**: `cohere-ai` (endpoint /ai-assistant).
- **Almacenamiento de imágenes**: `@vercel/blob` + `sharp` para optimización.
- **Correo**: `nodemailer` (envío de emails de bienvenida, orden y recuperación de contraseña).
- **Seguridad**: `bcrypt` (hash de contraseñas), `jsonwebtoken` (JWT para auth), `express-rate-limit`.

**Qué hace esta app**
- Registro, login y cierre de sesión de usuarios (con cookies HTTPOnly).
- Recuperación y restablecimiento de contraseña vía email.
- CRUD de productos (subida de imágenes optimizadas a Vercel Blob).
- Creación y gestión de órdenes; notificaciones por email a comprador y vendedor.
- Integración con MercadoPago: creación de preferencias y manejo de webhooks para actualizar el estado de órdenes.
- Endpoints para un blog administrativo (`calbuco_blog`).
- Endpoint de asistente IA: `GET /api/ai-assistant?message=...`.

**Estructura relevante**
- Punto de entrada: `src/index.js` (monta `appRouter` en `/api`).
- Rutas agrupadas en `src/routes/` (`auth`, `user`, `product`, `order`, `payment`, `calbuco_blog`).
- Controladores en `src/controllers/` (lógica principal de la API).
- Servicios en `src/services/` (MercadoPago, mail, Vercel Blob, Cohere).
- Modelos en `src/models/` (operaciones con la DB).

**Endpoints principales**
- **Autenticación**:
	- **POST** `/api/user/signup` : registro.
	- **POST** `/api/user/login` : login.
	- **POST** `/api/user/logout` : logout.
	- **POST** `/api/user/recovery-password` : solicita email de recuperación.
	- **POST** `/api/user/reset-password` : restablece contraseña (usa cookie de reset).
- **Usuario**:
	- **GET** `/api/user/profile` : perfil del usuario autenticado (auth requerida).
	- **GET** `/api/user/id` : obtiene usuario por `req.userId` (auth requerida).
	- **PUT** `/api/user/update` : actualiza perfil + avatar (`multipart/form-data`, auth requerida).
	- **PATCH** `/api/user/update` : actualiza datos de envío (auth requerida).
	- **DELETE** `/api/user/delete` : elimina usuario (auth requerida).
	- **GET** `/api/user/user_hero` : contenido hero público.
	- **POST** `/api/user/user_hero/:id` : actualiza hero (`multipart/form-data`, auth requerida).
	- **GET** `/api/user/user_footer` : contenido footer público.
	- **POST** `/api/user/user_footer/:id` : actualiza footer (`multipart/form-data`, auth requerida).
	- **GET** `/api/user/content` : contenido de descuentos público.
	- **PATCH** `/api/user/content-update` : actualiza contenido de descuentos (auth requerida).
- **Productos**:
	- **GET** `/api/list-products` : listar todos los productos públicos.
	- **GET** `/api/products` : listar productos del usuario (auth requerida).
	- **GET** `/api/product/:id` : detalle de producto (auth requerida).
	- **POST** `/api/product` : crear producto (auth requerida).
	- **PUT / DELETE** `/api/product/:id` : actualizar / eliminar (auth requerida).
- **Órdenes**:
	- **GET** `/api/seller/orders` : listar órdenes para seller.
	- **GET** `/api/user/orders/:user_id` : listar órdenes de un usuario.
	- **GET** `/api/user/order/:order_id` : detalle básico de orden.
	- **GET** `/api/orders/:order_id/details` : detalle completo de orden.
	- **POST** `/api/orders` : crear orden.
	- **PATCH** `/api/orders/:order_id/status` : actualizar estado de orden.
	- **DELETE** `/api/order/:order_id` : eliminar orden.
- **Pagos** (MercadoPago):
	- **POST** `/api/payment/create` : crea preferencia y genera `init_point` (auth requerida).
	- **POST** `/api/payment/webhook` : webhook que procesa notificaciones de MercadoPago y actualiza órdenes en DB.
- **Logs**:
	- **POST** `/api/loger` : registra mensajes en `logger_pascale`.

**Variables de entorno (importantes)**
- `NEON_DB_3`: cadena de conexión para Neon DB.
- `EMAIL_USER`, `EMAIL_PASS`: credenciales para `nodemailer` (Gmail en la implementación actual).
- `FRONT_URL`: URL del frontend (usada en redirecciones/back_urls).
- `BACKEND_URL`: URL pública del backend (usada para `notification_url` de MercadoPago).
- `MP_ACCESS_TOKEN` (o `MP_ACCESS_TOKEN` en `src/services/mercadoPago.service.js`): token de MercadoPago.
- `COHERE_TRIAL_APIKEY`: API key para Cohere.
- `JWT_SECRET`: secreto para firmar/verificar JWT.
- `PORT`: (opcional) puerto; por defecto `3606` si no está definido.

Ejemplo mínimo de `.env` (no incluir secretos en repositorios):

```bash
NEON_DB_3=<<url_conexion_neon>>
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_app_password
FRONT_URL=https://tu-frontend.example
BACKEND_URL=https://tu-backend.example
MP_ACCESS_TOKEN=xxxxxxxx
COHERE_TRIAL_APIKEY=xxxxxxxx
JWT_SECRET=secreto_largo
PORT=3606
```

**Instalación y ejecución (desarrollo)**
```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Por defecto el servidor escucha en el puerto 3606 (o el valor de $PORT)
```

**Notas operativas y seguridad**
- Mantener las variables de entorno (tokens, claves, credenciales) fuera del repositorio.
- El webhook de MercadoPago escribe logs en la BD (`webhook_errors`) y devuelve 200 aun en errores para evitar reintentos indeseados; revisar esos logs en caso de problemas.
- Las cookies de autenticación son HTTPOnly y `secure` (asegúrate de usar HTTPS en producción).

**Contribuir / extender**
- Añadir tests y CI.
- Externalizar la configuración de correo (soporte para proveedores distintos a Gmail).
- Añadir validaciones más estrictas (p. ej. `zod`) en las rutas de entrada.

---
Archivos clave: `src/index.js`, `src/routes/`, `src/controllers/`, `src/services/`.

**Modelos y constantes (nota del desarrollador)**
- Históricamente este proyecto comenzó usando un archivo de constantes con consultas SQL crudas para moverse rápido. Ese archivo está en `src/controllers/constants.js` y contiene la mayoría de las queries relacionadas con usuarios y productos (p. ej. `CREATE_USER`, `GET_PRODUCT_BY_ID`, `GET_ALL_PRODUCTS`, etc.).
- Posteriormente se empezaron a introducir modelos con métodos más organizados y transaccionales en `src/models/`. Hoy encontrarás:
	- `src/models/order.models.js`: implementación completa de `OrderModel` con transacciones para crear órdenes, consulta de detalles, actualización de estado y eliminación.
	- `src/models/payment.models.js`: `PaymentModel` con un método `createOrUpdate` que guarda (o actualiza) la información de pagos recibida desde MercadoPago.
	- `src/models/user.models.js`: actualmente vacío/placeholder (a implementar según evolución).
	- `src/models/generateOrder.js`: helper para generación de identificadores/ordenes.
- Estado actual: la API usa un enfoque híbrido — algunas rutas/controladores consumen las constantes SQL directamente, otras ya están delegando a modelos. Recomendación futura: migrar todas las operaciones a modelos (una capa por entidad) para centralizar validación, transacciones y tests.

**Middlewares importantes**
- `src/middlewares/isAuth.js`: verifica cookie JWT `pascale_token` y adjunta `req.userId`.
- `src/middlewares/blogAuth.js`: autenticación específica para rutas del blog (`calbuco_blog`).
- `src/middlewares/cors.js`: configuración CORS centralizada.

**Buenas prácticas sugeridas para seguir**
- Migrar queries de `src/controllers/constants.js` a modelos en `src/models/` (cada modelo expone métodos reutilizables y testables).
- Añadir validación de entrada en rutas con `zod` o similar antes de llegar a controladores.
- Centralizar la creación/uso del cliente DB (ya se usa `serverNeonDB` desde `src/config/neon/neonDbConfig.js`).

---
Si querés, puedo:
- Generar un `./.env.example` con las variables necesarias.
- Añadir una tabla resumen de endpoints (método, ruta, auth requerida) dentro del README.
- Empezar la migración de una o dos queries de `constants.js` a un modelo (p. ej. mover operaciones de usuario a `src/models/user.models.js`).

Dime cuál opción preferís y la hago: `(.env.example)`, `tabla de endpoints`, o `migrar queries a modelos`.
