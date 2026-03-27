# Workflow Manager

> Este proyecto es una respuesta a un challenge de entrevista. Los requisitos base pedían un sistema de gestión de workflows y alertas; la funcionalidad extra que agregué es la posibilidad de dejar un comentario al resolver un evento.

Un monorepo para definir workflows de alertas, dispararlos con un valor métrico y hacer seguimiento de los eventos y notificaciones resultantes.

---

### Requisitos

- [Bun](https://bun.sh) >= 1.3
- [Docker](https://www.docker.com) (para la base de datos)

### Configuración

**1. Instalar dependencias**

```bash
bun install
```

**2. Configurar variables de entorno**

```bash
cp apps/api/.env.sample apps/api/.env
cp apps/web-ui/.env.sample apps/web-ui/.env.local
```

Los valores por defecto funcionan directamente para desarrollo local — no es necesario cambiar nada salvo que la base de datos corra en un puerto distinto.

**3. Iniciar la base de datos**

```bash
docker compose up -d
```

**4. Ejecutar migraciones**

```bash
cd apps/api && bun run db:migrate:dev
```

**5. Poblar la base de datos** *(opcional pero recomendado)*

```bash
bun run db:generate # Genera el cliente de Prisma

bun run db:seed
```

Crea 4 workflows en distintos estados (3 activos, 1 inactivo; tipos threshold y variance), 15 eventos distribuidos entre dos de esos workflows (1 abierto, 14 resueltos) y sus notificaciones asociadas — suficientes datos para navegar y paginar desde el primer arranque.

**6. Iniciar los servidores de desarrollo**

Desde la raíz del repositorio:

```bash
bun dev
```

Esto inicia en paralelo la API (puerto 8000) y el frontend (puerto 3000).

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| API      | http://localhost:8000 |

---

### Nota para el entrevistador

La lógica de negocio principal está en `apps/api/src/features/trigger/trigger.service.ts`. Ahí es donde se verifica si el workflow está activo, se previenen eventos duplicados abiertos, se crean nuevos eventos y se encolan las notificaciones — todo en un solo lugar. El resto (routers, frontend) delega en este servicio.

---

### Decisiones de arquitectura

**Monorepo con Bun workspaces** — ambas apps viven en el mismo repositorio para que el contrato de tipos entre la API y el frontend (via tRPC) se pueda verificar a nivel de workspace sin necesidad de publicar paquetes.

**Tipado end-to-end con tRPC** — la API genera un archivo `server.ts` (`apps/api/src/@generated/server.ts`) que exporta el tipo `AppRouter`. El frontend importa únicamente ese tipo, por lo que cualquier cambio en el input o output de un procedimiento se manifiesta inmediatamente como un error de TypeScript en el cliente. Sin sincronización manual de tipos ni pasos de generación en el frontend.

**NestJS + nestjs-trpc** — cada dominio (workflows, events, notifications, trigger) es un módulo NestJS independiente con su propio router, service y archivo de schemas. Los routers son delgados y delegan toda la lógica a los services. La lógica de negocio nunca se filtra hacia la capa de transporte.

**La evaluación de triggers está aislada** — `TriggerService` es el único punto de entrada para disparar un workflow, tanto desde la UI de forma manual como desde cualquier automatización futura. Aplica dos invariantes: el workflow debe estar activo, y no puede existir ya un evento abierto para ese workflow.

**Las notificaciones son de escritura** — las notificaciones se guardan en la base de datos como `QUEUED` justo después de crear el evento. El envío real (email, push) está intencionalmente fuera del alcance; el schema está diseñado para que un worker en background pueda recoger los registros `QUEUED` y marcarlos como `DELIVERED`.
