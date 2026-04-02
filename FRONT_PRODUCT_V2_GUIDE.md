# Guía Front Agent — Product V2 (contrato real del backend)

Esta guía está pensada para que el agente de frontend pueda llegar a las requests correctas de Product V2 sin ambigüedades.

## 1) Contexto y reglas base

- Backend actual: las rutas están montadas **sin prefijo** en `src/index.js`.
- Base local sugerida: `http://localhost:3000` (o el host real de tu deploy).
- Si en algún entorno se expone detrás de `/api`, solo anteponer `/api` a todas las rutas.
- Todas las rutas V2 usan `isAuth` (cookie JWT), por lo tanto en frontend usar siempre:

```ts
credentials: "include";
```

Ejemplo base:

```ts
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const request = (path: string, init?: RequestInit) =>
  fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
```

---

## 2) Endpoints V2 (los que debe consumir el front)

### Lectura (listado y detalle)

- `GET /list-products` (público) -> devuelve `products_v2` con `variants[]` e `images[]`.
- `GET /products` (auth) -> devuelve productos del usuario desde `products_v2`.
- `GET /product-v2/:productId` (auth) -> detalle de producto con `variants[]`, `images[]`, `reviews[]`.

> Rutas V1 retiradas: ya no usar `GET /product/:id`, `POST /product`, `PUT /product/:id`, `DELETE /product/:id`.

## Producto base (`products_v2`)

### Crear producto

- `POST /product-v2`

Payload mínimo válido:

```json
{
  "name": "Buzo básico"
}
```

Payload recomendado:

```json
{
  "name": "Buzo básico",
  "description": "Frisa premium",
  "brand": "Pascale",
  "category": "buzos",
  "season": "invierno",
  "condition": "new"
}
```

Respuesta exitosa (`201`):

```json
{
  "product": {
    "id": 200,
    "user_id": "...",
    "name": "Buzo básico",
    "description": "Frisa premium",
    "brand": "Pascale",
    "category": "buzos",
    "season": "invierno",
    "condition": "new"
  }
}
```

Validación relevante:

- Si falta `name` -> `400` con mensaje de campos requeridos.

### Actualizar producto

- `PATCH /product-v2/:productId`

Regla: patch parcial; lo no enviado se conserva.

### Eliminar producto

- `DELETE /product-v2/:productId`

Respuesta (`200`):

```json
{
  "message": "Producto V2 eliminado correctamente.",
  "product": { "id": 200 }
}
```

---

## Variantes (`product_variants`)

### Crear variantes

- `POST /product-v2/:productId/variants`

El backend acepta:

1. Variante única:

```json
{
  "size": "S",
  "color": "Rojo",
  "price": 32990,
  "stock": 3,
  "sku": "BUZO-ROJO-S"
}
```

2. Lote:

```json
{
  "variants": [
    {
      "size": "S",
      "color": "Rojo",
      "price": 32990,
      "stock": 3,
      "sku": "BUZO-ROJO-S"
    },
    {
      "size": "S",
      "color": "Negro",
      "price": 32990,
      "stock": 1,
      "sku": "BUZO-NEGRO-S"
    }
  ]
}
```

Requisito obligatorio por variante:

- `price` y `stock`.

Respuesta (`201`):

```json
{
  "productId": 200,
  "variants": [
    {
      "id": 501,
      "product_id": 200,
      "size": "S",
      "color": "Rojo",
      "price": 32990,
      "stock": 3,
      "sku": "BUZO-ROJO-S"
    }
  ]
}
```

### Actualizar variante

- `PATCH /product-v2/:productId/variants/:variantId`

Patch parcial permitido, pero en backend la variante final debe seguir teniendo `price` y `stock`.

### Eliminar variante

- `DELETE /product-v2/:productId/variants/:variantId`

---

## Imágenes (`product_images`)

### Crear imágenes

- `POST /product-v2/:productId/images`

Formatos aceptados:

```json
{ "imageUrls": ["https://.../1.webp", "https://.../2.webp"] }
```

o

```json
{ "urls": ["https://.../1.webp", "https://.../2.webp"] }
```

o directamente array JSON:

```json
["https://.../1.webp", "https://.../2.webp"]
```

Regla:

- `sort_order` se asigna por índice si no se envía explícitamente.

### Actualizar imagen

- `PATCH /product-v2/:productId/images/:imageId`

Body aceptado:

```json
{ "imageUrl": "https://.../new.webp", "sortOrder": 0 }
```

También acepta `url` en lugar de `imageUrl`.

### Eliminar imagen

- `DELETE /product-v2/:productId/images/:imageId`

---

## Reviews (ahora sobre producto V2)

- `POST /product-v2/:productId/review`
- `PATCH /product-v2/:productId/review`
- `DELETE /product-v2/:productId/review`

Regla backend:

- la review valida que `productId` exista en `products_v2`.

Ruta legacy retirada:

- `POST|PATCH|DELETE /product/:id/review`

---

## 3) Flujo recomendado para frontend agent

1. `POST /product-v2` para obtener `product.id`.
2. Crear variantes:
   - recomendado UX: **1 request por fila** de variante para reportar errores por combinación,
   - o usar lote con `variants: []` para alta masiva.
3. `POST /product-v2/:productId/images` con URLs ya subidas desde front.
4. Guardar en estado local los IDs devueltos:
   - `product.id`
   - `variants[].id`
   - `images[].id`
5. Para edición posterior, usar `PATCH` por recurso puntual.

---

## 4) Manejo de errores (mapeo rápido)

- `400` payload inválido o faltan campos requeridos.
- `404` no existe `productId`, `variantId` o `imageId`.
- `500` error interno del backend.

Convención sugerida para el agente:

- leer `message` del JSON de error y mostrarlo tal cual al usuario/admin.

---

## 5) Ejemplos listos para copiar

Crear producto:

```ts
await request("/product-v2", {
  method: "POST",
  body: JSON.stringify({
    name: "Buzo básico",
    description: "Frisa premium",
    brand: "Pascale",
    category: "buzos",
    season: "invierno",
    condition: "new",
  }),
});
```

Crear una variante:

```ts
await request(`/product-v2/${productId}/variants`, {
  method: "POST",
  body: JSON.stringify({
    size: "S",
    color: "Rojo",
    price: 32990,
    stock: 3,
    sku: "BUZO-ROJO-S",
  }),
});
```

Crear imágenes:

```ts
await request(`/product-v2/${productId}/images`, {
  method: "POST",
  body: JSON.stringify({
    imageUrls: ["https://.../buzo-1.webp", "https://.../buzo-2.webp"],
  }),
});
```

---

## 6) Checklist para tu agente del front

- Siempre usar `credentials: "include"`.
- Nunca enviar variantes sin `price` o `stock`.
- Persistir IDs de producto/variantes/imágenes para updates/deletes.
- En errores, priorizar mensaje de backend (`message`).
- Si el entorno usa gateway con `/api`, prepender `/api` a todas las rutas.
