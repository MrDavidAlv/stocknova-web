# StockNova Web

Frontend SPA para el sistema de gestion de inventario StockNova.

## Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3 + shadcn/ui
- React Router v6
- TanStack React Query
- react-hook-form + Zod
- Cypress (E2E testing)

## Requisitos

- Node.js 18+
- pnpm 9+

## Instalacion

```bash
pnpm install
```

## Variables de entorno

Copiar `.env.example` a `.env` y configurar:

```bash
cp .env.example .env
```

| Variable | Descripcion | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL del backend (vacio en dev, Vite proxy lo maneja) | `""` |
| `CYPRESS_ADMIN_EMAIL` | Email del usuario admin para tests E2E | `admin@stocknova.com` |
| `CYPRESS_ADMIN_PASSWORD` | Password del admin para tests E2E | `your_password` |
| `CYPRESS_MANAGER_EMAIL` | Email del manager para tests E2E | `manager@stocknova.com` |
| `CYPRESS_MANAGER_PASSWORD` | Password del manager para tests E2E | `your_password` |
| `CYPRESS_VIEWER_EMAIL` | Email del viewer para tests E2E | `viewer@stocknova.com` |
| `CYPRESS_VIEWER_PASSWORD` | Password del viewer para tests E2E | `your_password` |

## Desarrollo

```bash
pnpm dev
```

Abre `http://localhost:8080` en el navegador. Vite proxy redirige `/api/*` al backend.

## Build

```bash
pnpm build
pnpm preview
```

## Tests

### Unit tests

```bash
pnpm test
```

### E2E tests (Cypress)

Requiere el dev server corriendo (`pnpm dev`).

```bash
# Abrir Cypress UI (interactivo)
pnpm cy:open

# Ejecutar en terminal (headless)
pnpm cy:run
```

**Tests incluidos:**

| Suite | Tests | Que verifica |
|-------|-------|-------------|
| `auth.cy.ts` | 7 | Login, logout, registro, validaciones, redirect |
| `products.cy.ts` | 7 | Listado, busqueda, crear, editar, detalle, paginacion |
| `categories.cy.ts` | 3 | Listado, cards seed, crear categoria |
| `roles.cy.ts` | 5 | Permisos por rol (Admin/Manager/Viewer) |

## Docker

```bash
docker build -t stocknova-web .
docker run -p 80:80 stocknova-web
```

## Estructura

```
src/
  core/          # API client (fetch nativo), auth context, types, layout
  features/      # Paginas por dominio (auth, products, categories, audit-logs)
  shared/        # Componentes y utilidades reutilizables
  components/ui/ # Componentes shadcn/ui
cypress/
  e2e/           # Tests E2E (auth, products, categories, roles)
  support/       # Comandos custom (login por rol)
```

## Deploy

Desplegado automaticamente via GitHub Actions en AWS EC2:

- **Frontend:** http://3.93.170.171
- **API docs:** http://3.93.170.171/swagger
