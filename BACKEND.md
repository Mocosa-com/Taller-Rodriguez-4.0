# Backend de Taller Rodriguez

Especificacion tecnica para convertir la SPA actual de React/Vite en una aplicacion multiusuario persistente y lista para produccion en un VPS.

## 1. Diagnostico del frontend actual

El frontend es una SPA de React 19 + TypeScript + Vite. `App.tsx` concentra el estado global, las mutaciones y las reglas de negocio. `LocalDataBase` no persiste realmente: sus metodos `get` devuelven datos iniciales y `set` no hace nada. Nomina y vacaciones se guardan aparte en `localStorage`.

Modulos detectados:

- Autenticacion y perfil de empleados.
- Dashboard, reportes y estadisticas.
- Clientes y vehiculos.
- Ordenes de reparacion implicitas: diagnostico, trabajos realizados, mecanico y estados del vehiculo.
- Inventario de productos y servicios.
- Proveedores.
- Ofertas y descuentos.
- Facturacion POS con IVA del 13%.
- Caja: apertura, cierre, efectivo, turnos y anulacion de facturas.
- Empleados, reportes disciplinarios, nomina y vacaciones.

Problemas que el backend debe corregir:

1. Las contrasenas estan en texto plano y existe una contrasena universal `123`.
2. Se puede cambiar de usuario/rol desde la interfaz sin una autorizacion real.
3. Facturar modifica factura, caja, inventario y vehiculo en varias mutaciones independientes.
4. Anular una factura no restaura inventario ni revierte correctamente todas sus consecuencias.
5. El turno se infiere por fecha/estado; la factura no guarda una relacion obligatoria con el turno.
6. Productos referencian proveedores por nombre y no por una clave foranea.
7. El diagnostico y los trabajos del vehiculo estan en un campo/array, sin historial de ordenes de trabajo.
8. El dashboard tiene estadisticas simuladas y una fecha fija.
9. Facturas, caja, nomina, vacaciones y auditoria no tienen una fuente de verdad comun.
10. Los IDs basados en `Date.now()` y codigos aleatorios no son adecuados para concurrencia.

## 2. Recomendacion tecnologica

### Opcion recomendada

Usar un monolito modular con:

- **NestJS** sobre Node.js LTS.
- **Fastify** como adaptador HTTP.
- **PostgreSQL 16 o superior** como base de datos principal.
- **Prisma ORM** para migraciones, tipado y acceso transaccional.
- **JWT de corta duracion en cookie HttpOnly** y refresh tokens rotatorios almacenados como hash.
- **Argon2id** para contrasenas.
- **Zod o class-validator** para validar cada entrada.
- **Swagger/OpenAPI** para documentar la API.
- **Pino** para logs estructurados.
- **Docker Compose**, Nginx y Certbot en el VPS.
- **S3 compatible o MinIO** para fotos, avatares y documentos; no guardar archivos grandes en PostgreSQL.

NestJS es preferible aqui porque el proyecto tiene modulos, roles, validaciones, transacciones y crecimiento previsto. Un solo servicio simplifica el despliegue en un VPS y evita la complejidad innecesaria de microservicios.

### Alternativas

- **Fastify + TypeScript + Drizzle**: buena opcion si se quiere un backend mas pequeno y control manual. Requiere definir mas convenciones de arquitectura.
- **Laravel + PostgreSQL**: excelente si el equipo domina PHP; no es la opcion mas natural junto al frontend TypeScript actual.
- **Supabase**: acelera el prototipo, pero añade dependencia de un servicio externo y hace menos directo el control de despliegue, backups y reglas transaccionales en un VPS propio.
- **Firebase**: no se recomienda para este caso por el modelo relacional de facturacion, caja e inventario.

No se recomienda implementar el backend con archivos JSON, `localStorage`, SQLite en produccion ni funciones serverless aisladas.

## 3. Estructura propuesta del backend

```text
backend/
  src/
    main.ts
    app.module.ts
    common/
      auth/          # JWT, guards, decoradores y permisos
      database/      # PrismaService
      errors/
      logging/
      pagination/
    modules/
      auth/
      users/
      customers/
      vehicles/
      work-orders/
      suppliers/
      products/
      inventory/
      offers/
      cash/
      invoices/
      payroll/
      vacations/
      reports/
      dashboard/
      files/
      audit/
  prisma/
    schema.prisma
    migrations/
    seed.ts
  test/
  Dockerfile
  .env.example
```

Cada modulo debe separar controller, DTO, service, repository/query y pruebas. El frontend solo debe llamar a la API; no debe decidir precios, impuestos, descuentos, permisos, stock ni totales.

## 4. Modelo de datos PostgreSQL

Usar `uuid` como clave primaria, `timestamptz` para fechas con hora y `numeric(12,2)` para dinero. Todos los importes se guardan en centavos o en `numeric`, pero nunca en `float`.

El siguiente SQL es la base conceptual de la primera migracion. Los nombres pueden adaptarse al estilo elegido en Prisma, pero no se deben eliminar las restricciones de negocio.

```sql
create extension if not exists pgcrypto;

create type user_role as enum ('ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO', 'SUPER_USUARIO');
create type vehicle_status as enum ('EN_REVISION', 'EN_ESPERA', 'ENTREGADO');
create type product_type as enum ('PRODUCTO', 'SERVICIO');
create type invoice_type as enum ('CONSUMIDOR_FINAL', 'CREDITO_FISCAL');
create type invoice_status as enum ('ACTIVA', 'ANULADA');
create type shift_status as enum ('ABIERTA', 'CERRADA');
create type vacation_status as enum ('PENDIENTE', 'APROBADO', 'GOZADO', 'RECHAZADO');

create table users (
  id uuid primary key default gen_random_uuid(),
  name varchar(150) not null,
  dui varchar(20) not null unique,
  phone varchar(30) not null,
  email varchar(254) unique,
  role user_role not null,
  base_salary numeric(12,2) not null default 0 check (base_salary >= 0),
  commission_percent numeric(5,2) not null default 0 check (commission_percent between 0 and 100),
  hired_at date not null,
  has_license boolean not null default false,
  avatar_url text,
  password_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  name varchar(150) not null,
  phone varchar(30) not null,
  dui varchar(20),
  email varchar(254),
  nit varchar(30),
  nrc varchar(30),
  address text not null,
  visit_frequency varchar(30) not null default 'REGULAR',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table suppliers (
  id uuid primary key default gen_random_uuid(),
  name varchar(150) not null,
  phone varchar(30) not null,
  location varchar(150) not null,
  email varchar(254),
  supplier_type varchar(20) not null,
  country varchar(100),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table vehicles (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  plate varchar(20) not null unique,
  make varchar(80) not null,
  model varchar(80) not null,
  model_year smallint not null check (model_year between 1900 and 2200),
  status vehicle_status not null default 'EN_REVISION',
  intake_at timestamptz not null default now(),
  delivered_at timestamptz,
  diagnosis text not null default '',
  assigned_mechanic_id uuid references users(id),
  photo_url text,
  registration_front_url text,
  registration_back_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table work_orders (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id),
  mechanic_id uuid references users(id),
  status varchar(30) not null default 'ABIERTA',
  diagnosis text not null default '',
  notes text not null default '',
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table work_order_tasks (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references work_orders(id) on delete cascade,
  description text not null,
  completed boolean not null default false,
  completed_at timestamptz
);

create table products (
  id uuid primary key default gen_random_uuid(),
  sku varchar(50) not null unique,
  name varchar(150) not null,
  type product_type not null,
  stock numeric(12,3) not null default 0 check (stock >= 0),
  purchase_price numeric(12,2) not null default 0 check (purchase_price >= 0),
  sale_price numeric(12,2) not null default 0 check (sale_price >= 0),
  supplier_id uuid references suppliers(id),
  classification varchar(100) not null,
  minimum_stock numeric(12,3) not null default 0 check (minimum_stock >= 0),
  maximum_stock numeric(12,3) not null default 0 check (maximum_stock >= minimum_stock),
  description text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table offers (
  id uuid primary key default gen_random_uuid(),
  name varchar(150) not null,
  description text not null default '',
  discount_percent numeric(5,2) not null check (discount_percent between 0 and 100),
  product_id uuid references products(id),
  starts_at date not null,
  ends_at date not null,
  active boolean not null default true,
  check (ends_at >= starts_at)
);

create table cash_shifts (
  id uuid primary key default gen_random_uuid(),
  shift_number integer not null unique,
  responsible_id uuid not null references users(id),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  opening_amount numeric(12,2) not null check (opening_amount >= 0),
  expected_amount numeric(12,2) not null default 0,
  counted_amount numeric(12,2),
  status shift_status not null default 'ABIERTA',
  notes text not null default ''
);

create unique index one_open_shift on cash_shifts(status) where status = 'ABIERTA';

create table invoices (
  id uuid primary key default gen_random_uuid(),
  code varchar(50) not null unique,
  customer_id uuid not null references customers(id),
  vehicle_id uuid references vehicles(id),
  shift_id uuid not null references cash_shifts(id),
  issued_by_id uuid not null references users(id),
  type invoice_type not null,
  subtotal numeric(12,2) not null check (subtotal >= 0),
  discount numeric(12,2) not null default 0 check (discount >= 0),
  taxable_base numeric(12,2) not null check (taxable_base >= 0),
  tax numeric(12,2) not null default 0 check (tax >= 0),
  total numeric(12,2) not null check (total >= 0),
  offer_id uuid references offers(id),
  status invoice_status not null default 'ACTIVA',
  issued_at timestamptz not null default now(),
  annulled_at timestamptz,
  annulled_by_id uuid references users(id),
  annulment_reason text
);

create table invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  product_id uuid not null references products(id),
  description varchar(150) not null,
  item_type product_type not null,
  quantity numeric(12,3) not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  line_total numeric(12,2) not null check (line_total >= 0)
);

create table inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  invoice_id uuid references invoices(id),
  performed_by_id uuid not null references users(id),
  quantity numeric(12,3) not null check (quantity <> 0),
  movement_type varchar(30) not null,
  reason text not null default '',
  created_at timestamptz not null default now()
);

create table employee_reports (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references users(id),
  created_by_id uuid not null references users(id),
  type varchar(50) not null,
  summary varchar(255) not null,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table salary_payments (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references users(id),
  paid_by_id uuid not null references users(id),
  period varchar(30) not null,
  amount numeric(12,2) not null check (amount >= 0),
  commission_percent numeric(5,2) not null default 0,
  detail text not null default '',
  paid_at timestamptz not null default now()
);

create table vacations (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references users(id),
  starts_on date not null,
  ends_on date not null,
  type varchar(50) not null,
  status vacation_status not null default 'PENDIENTE',
  comments text not null default '',
  total_days integer not null check (total_days > 0),
  approved_by_id uuid references users(id),
  check (ends_on >= starts_on)
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references users(id),
  action varchar(80) not null,
  entity varchar(80) not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  ip inet,
  created_at timestamptz not null default now()
);

create index vehicles_customer_idx on vehicles(customer_id);
create index invoices_issued_at_idx on invoices(issued_at);
create index invoices_customer_idx on invoices(customer_id);
create index inventory_product_date_idx on inventory_movements(product_id, created_at);
create index audit_entity_idx on audit_logs(entity, entity_id);
```

### Nota sobre datos fiscales

El esquema guarda subtotal, base gravable, IVA y total por separado. El servicio de facturacion debe recibir la tasa desde configuracion, actualmente 13%, y nunca recalcular un total confiando en el navegador. Antes de emitir comprobantes fiscales legales, validar los requisitos tributarios vigentes de El Salvador y conectar el proveedor autorizado o la facturacion electronica correspondiente.

## 5. Reglas de negocio obligatorias

### Autenticacion y permisos

- Login por DUI o correo/nombre normalizado; nunca por contrasena universal.
- Guardar solo `password_hash` con Argon2id.
- Access token corto, refresh token rotatorio, revocacion por dispositivo y logout real.
- Roles y permisos deben validarse en el backend en cada endpoint. El frontend solo oculta controles visuales.
- Administrador puede gestionar operacion y personal segun politica; Recepcionista puede clientes, vehiculos y ventas; Mecanico puede sus ordenes de trabajo; Super Usuario administra seguridad y configuracion.
- Impedir que un usuario se elimine a si mismo o que se quite el ultimo Super Usuario activo.
- Aplicar rate limit al login, bloqueo progresivo y registro de auditoria.

### Facturacion, caja e inventario

`POST /invoices` debe abrir una sola transaccion:

1. Bloquear el turno abierto con `SELECT ... FOR UPDATE`.
2. Validar que el usuario tenga permiso y que la caja este abierta.
3. Bloquear los productos de tipo producto y validar stock suficiente.
4. Releer precios, oferta, vigencia, restricciones y tasa de IVA desde la base.
5. Calcular subtotal, descuento, base, impuesto y total en el servidor.
6. Crear factura, items y movimiento de inventario.
7. Actualizar el efectivo esperado del turno.
8. Si hay vehiculo, marcarlo entregado solo mediante una regla explicita de la orden de trabajo.
9. Registrar auditoria y confirmar; si algo falla, hacer rollback completo.

La anulacion debe ser una operacion autorizada e idempotente: cambia el estado, crea movimientos de inventario de reversa, descuenta el esperado del turno original y guarda motivo, usuario y fecha. No se debe borrar una factura.

### Caja

- Solo un turno abierto globalmente, salvo que el negocio decida una caja por sucursal.
- Apertura requiere monto base y usuario autorizado.
- Cada factura activa debe tener `shift_id`.
- Cierre calcula esperado, registra efectivo contado, diferencia y observaciones.
- Los ajustes manuales de efectivo deben ser movimientos auditables, no una sobrescritura silenciosa.

### Inventario

- No permitir stock negativo.
- Toda entrada, salida, venta y reversa genera `inventory_movements`.
- No borrar productos usados por facturas; marcarlos inactivos.
- Al importar CSV/XLSX, validar formato, duplicados, SKU, precios y proveedor antes de aplicar cambios.

### Vehiculos y ordenes de trabajo

- Un cliente puede tener varios vehiculos.
- Un vehiculo puede tener muchas ordenes de trabajo y facturas.
- No almacenar el historial de trabajos como un array editable sin trazabilidad.
- Guardar fotos/documentos en almacenamiento de objetos y solo URLs en PostgreSQL.

## 6. API REST versionada

Prefijo: `/api/v1`. Todas las respuestas de error deben usar un formato estable:

```json
{
  "statusCode": 422,
  "code": "INSUFFICIENT_STOCK",
  "message": "Stock insuficiente para SKU-001",
  "details": []
}
```

Endpoints iniciales:

| Modulo | Endpoints principales |
|---|---|
| Auth | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`, `PATCH /auth/me/password` |
| Usuarios | `GET/POST /users`, `GET/PATCH/DELETE /users/:id`, `GET /users/:id/stats` |
| Clientes | `GET/POST /customers`, `GET/PATCH/DELETE /customers/:id`, `GET /customers/:id/vehicles` |
| Vehiculos | `GET/POST /vehicles`, `GET/PATCH /vehicles/:id`, `POST /vehicles/:id/deliver`, `GET /vehicles/:id/history` |
| Ordenes | `GET/POST /work-orders`, `GET/PATCH /work-orders/:id`, `POST /work-orders/:id/tasks` |
| Productos | `GET/POST /products`, `GET/PATCH /products/:id`, `POST /products/:id/activate` |
| Inventario | `GET /inventory/movements`, `POST /inventory/adjustments`, `GET /inventory/low-stock` |
| Proveedores | `GET/POST /suppliers`, `GET/PATCH/DELETE /suppliers/:id` |
| Ofertas | `GET/POST /offers`, `PATCH /offers/:id`, `DELETE /offers/:id` |
| Caja | `GET /cash/active`, `POST /cash/shifts`, `POST /cash/shifts/:id/close`, `POST /cash/adjustments`, `GET /cash/shifts` |
| Facturacion | `POST /invoices`, `GET /invoices`, `GET /invoices/:id`, `POST /invoices/:id/annul`, `GET /invoices/:id/receipt` |
| Personal | `GET/POST /salary-payments`, `GET/POST /vacations`, `PATCH /vacations/:id/status`, `GET/POST /employee-reports` |
| Dashboard | `GET /dashboard/summary`, `GET /dashboard/sales`, `GET /dashboard/inventory`, `GET /dashboard/employee-performance` |
| Archivos | `POST /files/presign`, `DELETE /files/:key` |
| Auditoria | `GET /audit-logs` |

Las listas deben soportar `page`, `pageSize`, `search`, `sort`, `from` y `to`. Limitar `pageSize` a un maximo razonable y no devolver contrasenas, hashes ni campos internos.

Ejemplo de payload para emitir factura:

```json
{
  "customerId": "uuid",
  "vehicleId": "uuid",
  "type": "CONSUMIDOR_FINAL",
  "offerId": "uuid",
  "items": [
    { "productId": "uuid", "quantity": 2 }
  ],
  "payment": { "method": "EFECTIVO", "received": 100 }
}
```

El cliente no debe enviar `total`, `tax`, `lineTotal`, nombre del producto ni precio confiable. Esos valores se calculan en el backend.

## 7. Migracion del frontend

1. Crear `src/api/httpClient.ts` con `fetch` tipado, base URL desde `VITE_API_URL`, manejo de 401 y errores estables.
2. Sustituir `LocalDataBase.get*` por queries por modulo; cargar datos con estados de carga, error y reintento.
3. Sustituir cada callback de `App.tsx` por una mutacion HTTP y refrescar/invalidatear la consulta afectada.
4. Mantener tipos DTO separados de los tipos de formulario y de las respuestas de API.
5. Eliminar contrasena de `Usuario`, acceso rapido y cambio libre de rol.
6. Mover nomina y vacaciones fuera de `localStorage`.
7. Mostrar permisos devueltos por `/auth/me`, pero conservar la autorizacion en el servidor.
8. Para facturacion, bloquear doble envio, mostrar errores de validacion del servidor y refrescar caja/inventario despues de una respuesta exitosa.
9. Reemplazar estadisticas fijas del dashboard por `/dashboard/*` con rango de fechas.
10. Mantener `mockData.ts` solamente como seed de desarrollo, nunca como fallback silencioso en produccion.

## 8. Despliegue en VPS

### Componentes

- Nginx publica HTTPS y sirve el build estatico de Vite.
- El contenedor `api` ejecuta NestJS en una red privada.
- PostgreSQL no debe exponerse publicamente; aceptar conexiones solo desde `api` y desde la red de backup.
- Redis es opcional para rate limit distribuido, colas y sesiones; no es necesario para el primer release.
- S3/MinIO almacena archivos.

Ejemplo de servicios de produccion:

```yaml
services:
  api:
    image: taller-rod-backend:latest
    restart: unless-stopped
    env_file: .env
    depends_on:
      postgres:
        condition: service_healthy
    networks: [private]

  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: taller
      POSTGRES_USER: taller
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U taller -d taller"]
    networks: [private]

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports: ["80:80", "443:443"]
    depends_on: [api]
    networks: [private]

volumes:
  postgres_data:

networks:
  private:
```

### Variables de entorno

Crear `.env.example` sin secretos:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://taller:CAMBIAR@postgres:5432/taller
JWT_ACCESS_SECRET=generar_un_secreto_largo
JWT_REFRESH_SECRET=generar_otro_secreto_largo
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
CORS_ORIGIN=https://taller.example.com
IVA_RATE=0.13
S3_ENDPOINT=
S3_BUCKET=taller-files
S3_ACCESS_KEY=
S3_SECRET_KEY=
```

### Procedimiento recomendado

1. Crear un usuario Linux sin privilegios de root y habilitar firewall solo para SSH, HTTP y HTTPS.
2. Instalar Docker y Docker Compose.
3. Configurar DNS del dominio hacia el VPS.
4. Publicar Nginx y emitir certificado con Certbot.
5. Inyectar secretos desde un archivo protegido con permisos `600` o un gestor de secretos.
6. Ejecutar `prisma migrate deploy` antes de iniciar la API.
7. Ejecutar el seed solo en una instalacion nueva y nunca sobre datos productivos.
8. Hacer health checks en `/health` y `/ready`.
9. Usar un proceso de despliegue versionado: imagen, migracion, health check y rollback.

### Backups y operacion

- Backup PostgreSQL diario completo y WAL/PITR si el volumen de negocio lo justifica.
- Copiar backups fuera del VPS y probar restauracion mensualmente.
- Retener logs con rotacion; nunca escribir tokens ni contrasenas.
- Monitorear uso de disco, RAM, CPU, expiracion SSL, salud de PostgreSQL y errores 5xx.
- Actualizar dependencias y sistema operativo con una ventana de mantenimiento.
- No exponer PostgreSQL, Prisma Studio, Redis ni puertos internos a Internet.

## 9. Calidad y pruebas antes de produccion

Pruebas obligatorias:

- Unitarias para calculo de IVA, descuentos, vuelto, permisos y dias de vacaciones.
- Integracion con PostgreSQL real para facturar, anular, cerrar caja y ajustar stock.
- Prueba de concurrencia: dos usuarios intentan vender las ultimas unidades al mismo tiempo.
- E2E de login, clientes, vehiculos, orden de trabajo, inventario, POS, caja y anulacion.
- Pruebas de migracion y restauracion de backup.
- Escaneo de dependencias, lint, typecheck y build del frontend y backend.
- Pruebas de abuso: rate limit, payloads invalidos, acceso por ID de otro usuario y permisos insuficientes.

Criterios de aceptacion del primer release:

- Ningun dato operacional depende de `localStorage`.
- Una factura activa siempre pertenece a un turno abierto y deja trazabilidad de inventario.
- Los totales se calculan exclusivamente en el servidor.
- Una anulacion es reversible en inventario y caja, y queda auditada.
- No existe ningun endpoint operativo sin autenticacion y permiso definido.
- Se puede levantar el sistema desde cero en el VPS mediante Docker y migraciones.
- Se puede restaurar la base de datos desde un backup probado.

## 10. Orden de implementacion

### Fase 1: base tecnica

NestJS, Prisma, PostgreSQL, configuracion, logger, health checks, Docker, migraciones y seed.

### Fase 2: seguridad

Usuarios, roles, permisos, login, refresh tokens, Argon2id, auditoria y eliminacion del acceso rapido.

### Fase 3: catalogos

Clientes, proveedores, productos, ofertas, vehiculos y archivos.

### Fase 4: operacion del taller

Ordenes de trabajo, asignacion de mecanicos, estados, historial y entrega.

### Fase 5: caja y facturacion

Turnos, movimientos de efectivo, POS, facturacion, stock, anulaciones e informes tributarios.

### Fase 6: personal y reportes

Nomina, vacaciones, reportes de empleados, dashboard y exportaciones.

### Fase 7: endurecimiento

Pruebas de concurrencia, backups, observabilidad, seguridad, rendimiento y despliegue automatizado.

## Conclusion

La opcion mas equilibrada para este proyecto es un monolito modular NestJS + Fastify + Prisma + PostgreSQL, desplegado con Docker Compose en el VPS. Permite conservar el frontend actual, reemplazar gradualmente el estado mock y mantener en una sola transaccion las operaciones que afectan dinero, inventario, caja y vehiculos. La base de datos propuesta agrega las relaciones y la trazabilidad que actualmente no pueden garantizarse desde React.