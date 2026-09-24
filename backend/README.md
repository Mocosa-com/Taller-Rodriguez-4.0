# Backend Taller Rodriguez

Primera fase local basada en NestJS, Fastify, Prisma y PostgreSQL. La configuracion cambia entre PC y VPS mediante variables de entorno; el codigo y las migraciones son los mismos.

## Requisitos

- Node.js 24 LTS o superior compatible.
- Docker Desktop con el motor Linux activo.

## Ejecutar en local

Desde esta carpeta:

```bash
npm install
docker compose up -d
npx prisma migrate deploy
npm run prisma:seed
npm run start:dev
```

API: `http://localhost:3001/api/v1`

Documentacion OpenAPI: `http://localhost:3001/docs`

Health check: `http://localhost:3001/api/v1/health`

Usuario seed:

- Identificador: `00000000-0`
- Contrasena: `TallerLocal2026!`

La contrasena es solo para evaluacion local. Debe cambiarse antes de cualquier despliegue.

## Comandos de calidad

```bash
npm run lint
npm run build
npx prisma validate
npx prisma generate
```

Para cambiar el esquema durante desarrollo:

```bash
npx prisma migrate dev --name descripcion-del-cambio
```

En VPS solo se usa:

```bash
npx prisma migrate deploy
```

## Endpoints funcionales de esta fase

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET/POST/PATCH/DELETE /api/v1/customers`
- `GET/POST/PATCH/DELETE /api/v1/products`
- `GET/POST/PATCH /api/v1/vehicles`
- `POST /api/v1/vehicles/:id/deliver`
- `GET /api/v1/cash/active`
- `GET /api/v1/cash/shifts`
- `POST /api/v1/cash/shifts`
- `POST /api/v1/cash/shifts/:id/close`
- `GET /api/v1/invoices`
- `POST /api/v1/invoices`
- `GET /api/v1/dashboard/summary`

La emision de factura se ejecuta en una transaccion serializable: valida caja, cliente, productos, oferta y stock; calcula IVA en el servidor; crea factura e items; descuenta inventario; registra movimiento y actualiza el efectivo esperado.

## Paso a VPS

1. Copiar `.env.example` a `.env` en el servidor.
2. Cambiar `DATABASE_URL`, secretos JWT, `CORS_ORIGIN` y credenciales de PostgreSQL.
3. No publicar el puerto de PostgreSQL a Internet.
4. Ejecutar la imagen con el `Dockerfile` y dejar Nginx como proxy HTTPS.
5. Ejecutar migraciones con `prisma migrate deploy`.
6. Crear el primer usuario con una herramienta segura o un seed controlado; no reutilizar la contrasena local.

No se guardan archivos de usuario en PostgreSQL en esta fase. Fotos y documentos se conectarán después a almacenamiento S3 compatible, conservando solo sus URLs.