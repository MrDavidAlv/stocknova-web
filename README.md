# StockNova Web

Frontend SPA para el sistema de gestion de inventario StockNova.

## Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3 + shadcn/ui
- React Router v6
- TanStack React Query
- react-hook-form + Zod

## Requisitos

- Node.js 18+
- pnpm 9+

## Instalacion

```bash
pnpm install
```

## Variables de entorno

Crear un archivo `.env` en la raiz:

```env
VITE_API_URL="http://localhost:5000"
```

## Desarrollo

```bash
pnpm dev
```

Abre `http://localhost:8080` en el navegador.

## Build

```bash
pnpm build
pnpm preview
```

## Estructura

```
src/
  core/          # API client, auth context, types, layout
  features/      # Paginas por dominio (auth, products, categories, audit-logs)
  shared/        # Componentes y utilidades reutilizables
  components/ui/ # Componentes shadcn/ui
```
