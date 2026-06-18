# TaskFlow

Aplicación de gestión de tareas colaborativa: equipos crean proyectos, agregan tareas con estados y asignaciones, y consultan el estado del trabajo.

Este documento responde técnicamente a las  decisiones de arquitectura, modelado, seguridad y —en particular— la estrategia de caché. Para levantar el proyecto y ver comandos/estructura, ir al [README del backend](./backend/README.md).

## Estructura del repositorio

```
taskflow/
├── backend/            API REST (NestJS + TypeORM + PostgreSQL)   ← implementado
├── frontend/           Interfaz web (No definido aún)                        ← no implementada a tiempo
└── docker-compose.yml  Postgres local
```

## Stack

Se usó el stack recomendado por la prueba: **NestJS + TypeORM + PostgreSQL** en el backend y **Posiblemente Vite React** en el frontend por resolución del PRD. la estrategia de caché (in-memory en vez de Redis), justificada más abajo.

---

## Arquitectura y organización del código

Arquitectura por capas con responsabilidades separadas y *screaming architecture* (la estructura grita el dominio: `features/authentication`, `features/projects`, `modules/tasks`).

- **Controllers** solo enrutan: reciben la request, delegan en un caso de uso y serializan la respuesta. No contienen lógica de negocio.
- **Casos de uso** (una clase, un `execute()`) concentran la lógica. Cada uno con `try/catch` que termina en un manejador centralizado de errores (`InternalError`).
- **Subqueries** encapsulan verificaciones/validaciones reutilizables (existencia, acceso, reglas). El control de acceso owner/miembro vive en una sola subquery, reutilizada por todos los casos de uso de proyectos y tareas.
- **Capa de datos** separada en servicios sobre repositorios TypeORM; las entidades se construyen con *entity builders* fluidos.
- **Inyección de dependencias** nativa de NestJS en todo el grafo.
- **Manejo de errores centralizado** y **respuesta uniforme**: todo endpoint devuelve la misma forma `{ ok, statusCode, internalCode, prefix, message, data, errors }`.
- **Configuración externalizada** en variables de entorno, validadas con `joi` al arranque mediante singletons de entorno por dominio (`server`, `database`, `auth`).
- **Puertos e implementaciones**: la sesión (logout server-side) y la caché viven detrás de interfaces (`SessionStore`, `CacheStore`), desacoplando los casos de uso de la tecnología concreta.

## Modelado de datos

Esquema relacional que refleja el dominio, con **migraciones controladas** (TypeORM, `synchronize: false`): el esquema se versiona migración por migración, nunca por *schema push*.

- **`users`** — credenciales (password con hash bcrypt) e identidad. Índice único parcial sobre `email` (`WHERE deleted_at IS NULL`), que además habilita reutilizar un correo tras un soft-delete.
- **`sessions`** — `jti` como PK (el guard verifica la sesión por clave primaria, O(1)); soporta la invalidación server-side del logout.
- **`projects`** / **`project_members`** — proyecto con dueño + tabla de membresía (PK compuesta `project_id + user_id`).
- **`tasks`** — pertenecen a un proyecto; estado (`PENDING|IN_PROGRESS|COMPLETED`), asignado y `completed_at` (para el tiempo de resolución).

Decisiones de modelado:
- **Soft-delete** vía `deleted_at` en todas las entidades (heredado de `EntityBase`).
- **Índices** en los campos consultados con frecuencia, cada uno justificado: `email`, `sessions.user_id`, `tasks.project_id`, `tasks.assignee_id`, e índices parciales de soft-delete.
- **Sin N+1**: los listados cargan relaciones con `leftJoinAndSelect` y paginan con `getManyAndCount` (una sola query), nunca en loops.

## Seguridad básica

- **Validación de input** en todos los endpoints con `class-validator` (pipe global). Los DTOs son la fuente de la verdad.
- **Contraseñas** con hash **bcrypt**, nunca en texto plano; política mínima (8+ caracteres, mayúscula, número, símbolo).
- **JWT Bearer** con expiración de 24 h. El **logout invalida la sesión del lado del servidor**: cada token lleva un `jti` registrado en `sessions`; el logout lo revoca y el guard rechaza cualquier token cuyo `jti` ya no esté activo (un JWT puramente stateless no permitiría esto).
- **Errores de credenciales ambiguos**: login fallido devuelve siempre el mismo `401` y mensaje, sin revelar si falló el correo o la contraseña.
- **CORS** configurado por entorno, **helmet** para headers de seguridad, **secretos en variables de entorno** (nada versionado; `.env` ignorado por git).

## Criterio técnico — estrategia de caché

El endpoint `GET /v1/projects/:projectId/summary` agrega estadísticas (totales por estado + tiempo promedio de resolución). El cálculo se resuelve en **una sola query** con `QueryBuilder` (`COUNT ... FILTER` por estado + `AVG(EXTRACT(EPOCH ...))`), pero crece en costo con el volumen de tareas: es un buen candidato a caché.

**Decisión: caché in-memory detrás de un puerto `CacheStore`.**

- **TTL de 60 segundos**: ventana corta que absorbe ráfagas de lecturas sin servir datos perceptiblemente viejos.
- **Invalidación por escritura**: al crear/actualizar una tarea o actualizar el proyecto se elimina la clave `project-summary:{projectId}`. Agregar un miembro no invalida (no afecta las estadísticas de tareas). El resultado: el resumen siempre refleja el último cambio.
- **Singleton garantizado**: la implementación es un `Map` provisto por un módulo `@Global()`, de modo que la invalidación desde un módulo afecta la lectura en otro.

**Compromisos (tradeoffs):**

| | In-memory (elegido) | Redis |
|---|---|---|
| Infra extra en el deploy | Ninguna | Un servicio a provisionar |
| Persistencia / reinicios | Se pierde al reiniciar | Sobrevive |
| Multi-instancia | Por instancia | Compartido entre procesos |
| Complejidad / modos de falla | Mínima | Mayor (cliente, conexión, caída) |

Para esta entrega —deploy de instancia única y ventana de tiempo acotada— in-memory es la opción **simple y bien razonada**: cero infraestructura adicional y cero modos de falla nuevos. Como la caché vive detrás de un puerto, migrar a Redis para un escenario multi-instancia es un *swap* del proveedor, sin tocar los casos de uso.

## Tests

Suite unitaria con Jest, ejecutable con un solo comando (`npm test` en `backend/`). Cubre los flujos críticos que pide la prueba: registro, login y verificación de permisos por usuario (owner / miembro / sin acceso), además de casos de uso, subqueries, builders, el guard y la caché. La calidad prima sobre el porcentaje: cada caso de uso valida sus caminos de éxito y error con aserciones sobre `statusCode`, `internalCode` y `ok`.

Además de los tests, cada slice se validó manualmente contra Postgres real (registro → login → rutas protegidas → logout → revocación; flujo completo de proyectos/tareas con permisos; resumen con invalidación de caché).

## Supuestos tomados ante ambigüedades

- **Membresía**: el dueño es miembro implícito; se puede agregar miembros por `userId` (sin invitaciones ni roles, fuera del alcance).
- **Semántica de acceso**: un tercero sin acceso recibe `404` (no se filtra la existencia del recurso); un miembro que intenta una acción exclusiva del dueño recibe `403`.
- **Estado de las tareas**: identificadores en inglés (`PENDING|IN_PROGRESS|COMPLETED`); la traducción a etiquetas es responsabilidad del frontend.
- **Tiempo promedio de resolución**: se calcula sobre tareas completadas (`completed_at − created_at`), en segundos; `null` si no hay tareas completadas.

---

## Uso de IA

- **Herramienta**: Claude Code (Anthropic).
- **Para qué se usó**: implementación del backend siguiendo un flujo *spec-driven* (propuesta → especificación → diseño → tareas → implementación → verificación) por cada historia de usuario, generación de la suite de tests unitarios, y scaffolding de la estructura y las migraciones TDD.
- **Qué se modificó, descartó o corrigió, y por qué**: la dirección técnica y todas las decisiones fueron del desarrollador, que revisó y corrigió el output de forma iterativa. Entre otras:
  - Se **normalizaron los DTOs** al patrón propio (propiedades `public`, `Nullable<T>` + `@ValidateIf` en los create, `PartialType` en los update, `?` solo en query): la IA los había generado con un estilo distinto.
  - Se **rechazó un bug** que la IA/un cambio introdujo en la expiración del JWT (`Number('24h')` da `NaN` y rompe el firmado); se corrigió manteniendo el string de duración con un tipo preciso en lugar de `any`.
  - Se **eliminaron casts poco seguros** (`as any`, `as unknown as`) en favor de tipos correctos o mapeo explícito de campos.
  - Se **establecieron y aplicaron convenciones**:(documentación en Swagger), tests, imports por alias, tipos globales `Nullable`/`Maybe`, todo endpoint a través de un caso de uso, y respuesta uniforme con valores por defecto.
  - Cada slice se cerró con una **revisión adversarial y un smoke manual** contra la base real, no solo con los tests unitarios (que, por ejemplo, no detectaban un fallo de validación que sí apareció al ejercitar el endpoint).

---

## Despliegue

> **Pendiente.** URL de producción y credenciales de prueba se completan al desplegar.

- URL de producción: _por definir_
- Credenciales de prueba: _por definir_
