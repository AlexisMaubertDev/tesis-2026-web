# ParkControl — Aplicación web

Frontend web del sistema **ParkControl**: administración de una playa de acarreo de
vehículos (gestión de usuarios, sucursales, cajas, barreras, grúas, vehículos,
acarreos, cobros y auditoría). Para el detalle completo del sistema ver
`CONTEXT.md`, `REQUIREMENTS.md` y `HALLAZGOS.md` en la raíz del proyecto.

## Stack

- React 19 + TypeScript
- Vite (dev server y build)
- Tailwind CSS + MUI (componentes puntuales)
- Redux Toolkit + redux-persist (sesión)
- React Router

## Requisitos

- Node.js 20+ (probado con 20+; el backend corre con Node 20+).
- El backend `tesis-2026-server` corriendo en `http://localhost:1337` (o el host que se ponga en `VITE_API_URL`).

## Variables de entorno

Copiar `.env.example` a `.env` y ajustar:

```bash
cp .env.example .env
```

| Variable | Descripción | Default |
|---|---|---|
| `VITE_API_URL` | URL base de la API del backend | `http://localhost:1337/api` |

> En WSL la API puede no ser alcanzable por `localhost`; usar `http://172.25.16.1:1337/api` (host de Windows) si corresponde.

## Scripts

```bash
npm run dev      # Servidor de desarrollo con HMR (http://localhost:5173)
npm run build    # tsc -b + Vite build (output en dist/)
npm run lint     # ESLint sobre src/
npm run preview  # Sirve el build de dist/
```

## Verificación antes de commitear

```bash
npm run lint && npm run build
```

Ambos deben pasar sin errores.

## Estructura

Feature-based (`src/features/<dominio>/`), con `pages/`, `components/`, `services/`, `types/`.
El detalle de cada módulo está en `CONTEXT.md` §8.

## Notas de desarrollo

- **Finales de línea:** el repo fuerza LF mediante `.gitattributes`. No commitear CRLF.
- **Persistencia de sesión:** redux-persist guarda la sesión en `localStorage["persist:root"]`. Si un
  token vence o es inválido, el interceptor de `src/services/api.ts` cierra la sesión y redirige a
  `/login`.
- **Roles:** `PLAYERO`, `CAJERO`, `SUPERVISOR`, `SISTEMAS` (`src/app/constants/roles.ts`). Las
  acciones de la UI se ocultan según el rol, y el backend valida con middlewares.
- **Credenciales de prueba:** ver `CREDENCIALES.md` en la raíz del proyecto (no se versiona).
- **Detección de cambios de schema:** el backend ya no sincroniza el schema al arrancar; si se
  agregan columnas o modelos hay que correrlo a mano (ver `HALLAZGOS.md` §3).
