# TaskFlow — Backend

API REST para gestión de tareas colaborativa, construida con **NestJS + TypeORM + PostgreSQL**.

Esta guía cubre cómo levantar el proyecto, los comandos disponibles, la estructura y los patrones de implementación. Para las decisiones de arquitectura y las respuestas técnicas a la prueba, ver el [README raíz](../README.md).

---

## Stack

| Capa | Tecnología |
|---|---|
| Runtime | Node.js + TypeScript (CommonJS) |
| Framework | NestJS 11 (`@nestjs/platform-express`) |
| ORM / DB | TypeORM 0.3 + PostgreSQL 16 |
| Auth | JWT (`@nestjs/jwt`) + bcrypt |
| Validación | `class-validator` + `class-transformer` |
| Config | `joi` (validación de entorno) |
| Seguridad | `helmet`, CORS |
| Docs API | Swagger (`@nestjs/swagger`) |
| Tests | Jest (`ts-jest`) |

---

## Requisitos previos

- Node.js 20+
- Docker + Docker Compose (para Postgres local)

---

## Cómo levantar el proyecto

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de entorno a partir del ejemplo
cp .env.example .env
#    Editar .env y definir un JWT_SECRET propio

# 3. Levantar Postgres (desde la raíz del repo)
docker compose -f ../docker-compose.yml up -d

# 4. Aplicar las migraciones (crea el esquema; synchronize está deshabilitado)
npm run migration:run

# 5. Arrancar en modo desarrollo
npm run start:dev
```

La API queda en `http://localhost:3000` con prefijo de versión `/v1`.
La documentación Swagger en `http://localhost:3000/docs`.

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `API_VERSION` | Prefijo global de rutas | `v1` |
| `ALLOWED_ORIGINS` | Orígenes CORS (CSV) | `http://localhost:3000` |
| `ALLOWED_METHODS` | Métodos CORS (CSV) | `GET,POST,PUT,DELETE,PATCH` |
| `ALLOWED_HEADERS` | Headers CORS (CSV) | `Content-Type,Authorization` |
| `TRUST_PROXY_HOPS` | Saltos de proxy confiables | `1` |
| `DATABASE_URL` | Cadena de conexión Postgres | `postgresql://taskflow:taskflow@localhost:5432/taskflow` |
| `JWT_SECRET` | Secreto de firma del JWT | `<secret-here>` |
| `JWT_EXPIRES_IN` | Expiración del token | `24h` |

Ningún secreto se versiona: `.env` está ignorado por git, solo se versiona `.env.example`.

---

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run start:dev` | Arranca con watch |
| `npm run build` | Compila a `dist/` |
| `npm run start:prod` | Corre el build de producción |
| `npm test` | Corre la suite de tests (un solo comando) |
| `npm run test:cov` | Tests con cobertura |
| `npm run lint` | ESLint con autofix |
| `npm run migration:generate -- src/application/services/database/migrations/<Nombre>` | Genera una migración a partir de los cambios de entidades |
| `npm run migration:run` | Aplica las migraciones pendientes |
| `npm run migration:revert` | Revierte la última migración |

> Las migraciones corren **build-first** contra `dist/` (TypeORM CLI sobre el output compilado). Por eso los scripts hacen `npm run build` antes.

---

## Estructura del proyecto

```
src/
├── main.ts                     Bootstrap: env, helmet, CORS, pipe global, Swagger, listen
├── environment/                Singletons de entorno (patrón joi + dotenv)
│   ├── load.environment.ts     Carga idempotente de .env
│   ├── server.environment.ts   PORT, API_VERSION, CORS, TRUST_PROXY_HOPS
│   ├── database.environment.ts DATABASE_URL
│   └── auth.environment.ts     JWT_SECRET, JWT_EXPIRES_IN
├── tools/
│   ├── internal-codes.ts       Enum de códigos internos de respuesta
│   └── type.d.ts               Tipos globales (Nullable<T>, Maybe<T>, TPagination<T>)
└── application/
    ├── app.module.ts
    ├── common/                 Bloques reutilizables
    │   ├── bases/              EntityBase (timestamps, soft-delete, update/prune)
    │   ├── builders/           ApiResponse / OriginError / InternalError
    │   ├── dto/                PaginatorDto, ParamUuidDto
    │   ├── pipes/              DtoValidatorPipe (validación global)
    │   ├── utils/              HashUtil (bcrypt), etc.
    │   └── validators/         IsStrongPassword + política de contraseñas
    ├── decorators/             @Public, @JwtPayload / @CurrentUser
    ├── guards/                 JwtAuthGuard (global)
    ├── services/               Infraestructura
    │   ├── auth/               Puerto SessionStore + impl en DB
    │   ├── cache/              Puerto CacheStore + impl in-memory (CacheModule global)
    │   └── database/           DataSource + DatabaseModule + migraciones
    └── features/               Dominio
        ├── authentication/     Registro, login, logout, perfil
        └── projects/           Proyectos + membresía
            └── modules/tasks/  Submódulo de tareas (anidado)
```

Cada feature sigue la misma forma: `controller`, `module`, `use-cases/`, `subqueries/`, `entities/` (+ `*.entity.builder.ts`), `services/`, `dtos/`.

---

## Patrón de implementación

Flujo de una request:

```
HTTP → DtoValidatorPipe (valida el DTO)
     → JwtAuthGuard (global; @Public exime register/login)
     → Controller (solo enruta; @Res manual, el status lo decide el use-case)
     → UseCase.execute(payload, dto)   try/catch → InternalError
         ├── Subquery de verificación   → [error | null, entity | null]   (early return)
         ├── Subquery de validación      → TOriginError[]
         ├── EntityBuilder.create().withX().build()
         └── Service (repositorio TypeORM)
     → ApiResponse.create()...build()   → res.status(result.statusCode).json(result)
```

Piezas clave:

- **Use cases**: una clase, un método `execute()`. Toda la lógica de negocio vive acá, nunca en el controller.
- **Subqueries**: unidades reutilizables de verificación/validación. Ej. `verify-project-access` resuelve owner-OR-member en una sola query y centraliza el control de acceso.
- **Entity builders**: construcción fluida y validada de entidades (`static create().withX().build()`).
- **Puertos (interfaces + Symbol)**: `SessionStore` y `CacheStore` desacoplan la implementación. Hoy: sesiones en DB, caché in-memory. Mañana: swap a Redis sin tocar los use-cases.
- **Respuesta unificada**: todo endpoint devuelve `TApiResponse { ok, statusCode, internalCode, prefix, message, data, errors }`.
- **Paginación**: `TPagination<T>` con `QueryBuilder` + `getManyAndCount` (sin N+1, sin SQL crudo).

---

## Convenciones

- **DTOs como fuente de la verdad**: propiedades `public`; los create usan `Nullable<T>` + `@ValidateIf` (sin `?` ni `@IsOptional`); los update son `PartialType(CreateDto)`; solo los query usan `?`. La validación vive en el DTO, no en el use-case.
- **Sin comentarios en el código**: la documentación de la API vive en Swagger (`@ApiOperation`, `@ApiProperty`, `@ApiResponse`).
- **Tipos globales**: `Nullable<T>` / `Maybe<T>` en vez de `| null` / `| undefined`.
- **Imports por alias** (`@common`, `@features`, `@services`, `@environment`, `@tools`, etc.).
- **Migraciones controladas**: `synchronize: false` siempre; el esquema se versiona por migración.
- **Tests**: unitarios co-located (`*.spec.ts`), descripciones en español, instanciación directa con mocks planos.

---

## Documentación de la API (Swagger)

Con el servidor levantado: **`http://localhost:3000/docs`**. Incluye el esquema Bearer para autenticar los endpoints protegidos.

### Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/v1/auth/register` | — | Registro |
| POST | `/v1/auth/login` | — | Login (devuelve JWT 24h) |
| POST | `/v1/auth/logout` | Bearer | Logout (invalida la sesión server-side) |
| GET | `/v1/auth/me` | Bearer | Perfil del usuario autenticado |
| POST | `/v1/projects` | Bearer | Crear proyecto |
| GET | `/v1/projects` | Bearer | Listar proyectos (paginado, owner o miembro) |
| GET | `/v1/projects/:projectId` | Bearer | Detalle del proyecto |
| PATCH | `/v1/projects/:projectId` | Bearer | Actualizar proyecto |
| DELETE | `/v1/projects/:projectId` | Bearer | Borrar proyecto (soft, solo owner) |
| POST | `/v1/projects/:projectId/members` | Bearer | Agregar miembro (solo owner) |
| GET | `/v1/projects/:projectId/summary` | Bearer | Resumen con estadísticas (cacheado) |
| POST | `/v1/projects/:projectId/tasks` | Bearer | Crear tarea |
| GET | `/v1/projects/:projectId/tasks` | Bearer | Listar tareas (paginado) |
| PATCH | `/v1/projects/:projectId/tasks/:taskId` | Bearer | Actualizar tarea |

---

## Tests

```bash
npm test          # toda la suite
npm run test:cov  # con cobertura
```

Cobertura de unidades de negocio: casos de uso, subqueries de permisos, builders, guard, store in-memory y los singletons de entorno. Los flujos de autenticación y los permisos por usuario (owner/miembro/sin acceso) están cubiertos.
