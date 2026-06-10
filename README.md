# VoltTrack — Gym Performance Tracker

> Registra cada serie, calcula tus PRs automáticamente y visualiza 365 días de progreso.  
> Gratis para siempre. Sin anuncios. Sin límites.

**Live:** [progress-gym-tracker.vercel.app](https://progress-gym-tracker.vercel.app)  
**Repo:** [github.com/alejoramirez27/Progress-Gym-Tracker](https://github.com/alejoramirez27/Progress-Gym-Tracker)

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript |
| Base de datos | Supabase (PostgreSQL) |
| Estilos | CSS Variables custom + Tailwind base |
| Animaciones | motion/react (Motion v12) |
| Gráficas | Recharts (LineChart, BarChart) |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Push notifications | web-push + VAPID |
| Deploy | Vercel |

---

## Funcionalidades

### Auth
- Login / Registro con email y contraseña
- Sesión via cookie HTTP-only `gym_session` (7 días)
- Middleware de protección en `src/proxy.ts`
- Aislamiento multi-usuario completo

### Rutinas
- CRUD completo con día de semana asignado
- Reordenar rutinas y ejercicios con drag & drop (mouse + táctil)
- Duplicar rutina con todos sus ejercicios
- Autocompletado desde banco de 60+ movimientos en 9 grupos musculares

### Progreso (registro de sesión)
- Date picker personalizado (sin picker nativo del OS)
- Pesos anteriores como placeholder automático
- Toggle kg/lb por ejercicio con conversión automática
- Notas por serie
- Resumen post-sesión: series, volumen y nuevos PRs detectados
- Canvas confetti al batir un PR
- Numpad táctil personalizado en móvil
- Repetir sesión desde Historial como plantilla

### Dashboard
- Racha actual / mejor racha / sesiones esta semana
- Volumen esta semana vs semana pasada (con % cambio)
- Widget de peso corporal con sparkline de 7 días
- Heatmap de 365 días estilo GitHub — 5 niveles de saturación por volumen
- Gráficas: progreso de peso por ejercicio + volumen por sesión
- Nota del día
- Botón de activar notificaciones push

### Historial
- Sesiones agrupadas por mes y semana con búsqueda en tiempo real
- Filtro por grupo muscular
- Comparar vs. sesión anterior: `+X kg` / `-X kg` por ejercicio con icono de tendencia
- Editar sesión
- Compartir sesión como imagen PNG descargable

### Récords Personales
- Peso máximo histórico por ejercicio agrupado por rutina
- 1RM estimado con fórmula Epley: `peso × (1 + reps / 30)`
- Gráfica de evolución temporal por ejercicio (SVG custom con área)
- Vista "Top 1RM" con ranking y medallas
- Compartir PR individual vía Web Share API / clipboard

### Peso Corporal
- Página `/peso` con LineChart de evolución
- Gráfica de evolución de 1RM de los top ejercicios (Epley)
- Historial con indicadores de tendencia
- Widget rápido en Dashboard

### Notificaciones Push
- Web Push con VAPID (funciona con la pestaña cerrada)
- Cron diario a las 7pm Colombia: alerta si racha ≥ 3 días y no entrenaste hoy
- Suscripción guardada en Supabase; limpieza automática de suscripciones expiradas

### Onboarding
- Modal de bienvenida en 4 pasos al primer login
- Se muestra de nuevo en cada login fresco (flag limpiado al autenticarse)

---

## PWA

- `manifest.webmanifest` con `display: standalone`, `start_url: /dashboard`
- Íconos generados con `next/og` (ImageResponse) — lightning bolt SVG
- Service worker en `/public/sw.js` para notificaciones push
- Instalable en iOS y Android sin App Store

---

## Design System (Light Theme)

| Token | Valor | Uso |
|-------|-------|-----|
| `--surface-base` | `#ffffff` | Fondo principal |
| `--surface-raised` | `#f8f9fb` | Nav items, hover |
| `--accent` | `#2d7fad` | Azul acero — acento principal |
| `--text-primary` | `#111318` | Texto principal |
| `--text-secondary` | `#4a5057` | Texto secundario |
| `--success` | `#6dba8e` | Confirmaciones |
| `--error` | `#e05454` | Errores |

**Fuente:** Lexend — 300 / 500 / 600–700  
**Radios:** 4 · 6 · 8 · 12 · 16 px

---

## API Endpoints

| Método | Endpoint | Descripción |
|--------|---------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/registro` | Crear cuenta |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET/POST | `/api/rutinas` | Listar / crear rutinas |
| GET/PUT/DELETE | `/api/rutinas/[id]` | Detalle / editar / eliminar |
| POST | `/api/rutinas/[id]/duplicar` | Duplicar rutina |
| GET/POST | `/api/sesiones` | Listar / crear sesiones |
| PUT/DELETE | `/api/sesiones/[id]` | Editar / eliminar sesión |
| GET | `/api/historial` | Sesiones con comparación anterior |
| GET | `/api/records` | PRs con 1RM y evolución |
| GET | `/api/dashboard` | Stats, heatmap, progreso, volumen |
| GET/PUT | `/api/perfil` | Ver / actualizar perfil |
| GET | `/api/export` | Descargar historial CSV |
| GET/POST/DELETE | `/api/peso-corporal` | Tracking de peso corporal |
| GET | `/api/peso/1rm` | 1RM top ejercicios |
| POST/DELETE | `/api/push/subscribe` | Suscripción push |
| GET | `/api/push/send-racha` | Cron: notificación racha en riesgo |

---

## Base de datos

```sql
usuario           id_usuario uuid PK, nombre, email, password_hash
rutina            id_rutina uuid PK, id_usuario FK, nombre, dia_semana, orden
ejercicio         id_ejercicio uuid PK, id_rutina FK, nombre, grupo_muscular, orden, num_series
sesion            id_sesion uuid PK, id_usuario FK, id_rutina FK, fecha, nota
serie             id_serie uuid PK, id_sesion FK, id_ejercicio FK, peso_kg, repeticiones, rir, notas, numero_serie
peso_corporal     id uuid PK, id_usuario FK, fecha date, peso_kg numeric — UNIQUE(id_usuario, fecha)
push_subscriptions id uuid PK, id_usuario FK, endpoint, p256dh, auth — UNIQUE(id_usuario, endpoint)
```

> PK de usuario es `id_usuario` (no `id`). DB siempre almacena en kg.

---

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=
CRON_SECRET=
```

---

## Correr localmente

```bash
git clone https://github.com/alejoramirez27/Progress-Gym-Tracker.git
cd Progress-Gym-Tracker
npm install
# crear .env.local con las variables de entorno
npm run dev   # → http://localhost:3000
```

Ejecutar el SQL de `supabase/migrations/push_notifications.sql` en el SQL Editor de Supabase para crear la tabla de notificaciones push.
