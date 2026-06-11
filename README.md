# VoltTrack — Gym Performance Tracker

> Registra cada serie, calcula tus PRs automáticamente y visualiza 365 días de progreso.  
> Gratis para siempre. Sin anuncios. Sin límites.

**Live:** [progress-gym-tracker.vercel.app](https://progress-gym-tracker.vercel.app)  
**Repo:** [github.com/alejoramirez27/Progress-Gym-Tracker](https://github.com/alejoramirez27/Progress-Gym-Tracker)

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16.2.6 (App Router) |
| Lenguaje | TypeScript 5 |
| Base de datos | Supabase (PostgreSQL) |
| Estilos | CSS Variables custom + Tailwind 4 base |
| Animaciones | motion/react v12 (Motion) |
| Gráficas | Recharts 3 (LineChart, BarChart) |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Confeti | canvas-confetti |
| Export imagen | html-to-image |
| Push notifications | web-push + VAPID |
| Toasts | Sonner |
| UI primitives | Radix UI (Dialog, Select, Label, Separator) |
| Deploy | Vercel |

---

## Funcionalidades

### Auth
- Login y registro con email + contraseña
- Login con Google (OAuth 2.0) vía `/api/auth/google`
- Sesión persistente via cookie HTTP-only `gym_session` con duración de 7 días
- Flag `volttrack_onboarding_done` limpiado en cada login para que el onboarding aparezca siempre en sesiones frescas
- Middleware de protección de rutas en `src/proxy.ts` (no `middleware.ts`): sin sesión → `/login`; con sesión en `/login` o `/registro` → `/dashboard`
- Aislamiento multi-usuario completo — cada usuario solo ve sus propios datos

### Onboarding
- Modal de 4 pasos al primer acceso después de cada login
- Pasos: bienvenida, PRs automáticos, dashboard con heatmap, racha de entrenamiento
- Animaciones de entrada con motion/react, respeta `prefers-reduced-motion`
- Flag en `localStorage` (`volttrack_onboarding_done`) — se borra en login/registro para que aparezca siempre en sesiones nuevas

### Rutinas
- CRUD completo de rutinas: crear, editar, eliminar, reordenar
- Asignación de día de semana por rutina
- Reordenar rutinas con drag & drop (mouse + táctil) — @dnd-kit
- Duplicar rutina completa con todos sus ejercicios
- CRUD de ejercicios dentro de cada rutina con autocompletado desde banco de 60+ movimientos agrupados en 9 grupos musculares
- Reordenar ejercicios dentro de la rutina con drag & drop nativo (HTML5 drag events)
- Configurar días de descanso manual por rutina (no rompen la racha)

### Progreso (registro de sesión)
- Selección de rutina + date picker personalizado (diseño propio, sin picker nativo del OS)
- Pesos anteriores de la última sesión de esa rutina aparecen automáticamente como placeholder de referencia
- Series dinámicas: agregar o eliminar en tiempo real; la última serie se copia como base para la siguiente
- Toggle kg/lb por ejercicio — al cambiar de unidad los valores se convierten automáticamente; la DB siempre almacena en kg
- Notas por serie (campo expandible por ejercicio)
- Bloqueo de cierre de pestaña + modal de confirmación si hay datos sin guardar
- Numpad táctil personalizado en móvil al editar campos de kg, repeticiones o RIR — evita el teclado nativo del OS
- Resumen post-sesión al guardar: total de series, volumen total en kg y nuevos PRs detectados
- Canvas confetti (3 rafagas) al detectar un nuevo PR al guardar la sesión
- Micro-animación check verde con rebote (`scale 0 → 1.2 → 1`) al confirmar cada serie
- Repetir sesión: carga plantilla de la última sesión desde Historial directamente en Progreso

### Dashboard
- KPIs: racha actual, sesiones esta semana, volumen esta semana vs semana pasada (con % cambio), mejor racha
- Widget de peso corporal con sparkline de 7 días y registro rápido inline
- Heatmap de 365 días estilo GitHub: 5 niveles de saturación OKLCH por volumen de kg movidos
  - Celdas clickeables que navegan al historial del día
  - Toggle "ver todo el año" vs vista de 12 semanas recientes
  - Días de descanso marcados como no activos (no rompen racha)
- Gráfica dual con tabs: progreso de peso máximo por ejercicio (LineChart filtrable por rutina y ejercicio) y volumen total por sesión (BarChart últimas 30 sesiones)
- Nota del día guardada en `localStorage` por fecha
- Botón de activar/desactivar notificaciones push (Web Push)
- Empty states con copy motivador cuando no hay datos

### Historial
- Sesiones agrupadas por mes y semana con búsqueda en tiempo real por nombre de rutina o fecha
- Filtro por grupo muscular: pills dinámicas generadas desde los grupos reales del usuario
- Expandir sesión para ver todos los ejercicios y series con detalle completo
- Comparación vs. sesión anterior de la misma rutina: `+X kg` / `-X kg` por ejercicio con iconos TrendingUp / TrendingDown / Minus
- Editar sesión (reemplaza series, preserva fecha y rutina)
- Eliminar sesión con confirmación
- Botón ↺ Repetir: precarga la sesión en Progreso como plantilla
- Compartir sesión como imagen PNG descargable: genera una card con branding VoltTrack, fecha, nombre de rutina, stats (volumen, series, ejercicios), lista de ejercicios con peso máximo y footer — todo con html-to-image a 2x de resolución

### Récords Personales (PRs)
- Peso máximo histórico por ejercicio, agrupado por rutina
- 1RM estimado con fórmula Epley: `peso × (1 + reps / 30)`
- Evolución `+X kg` desde el primer registro con chip verde
- Gráfica de progreso temporal por ejercicio: SVG custom con área bajo la curva, puntos interactivos, tooltip con peso y fecha, eje X con primera y última fecha, eje Y con 3 ticks
- Vista "Top 1RM": ranking plano de todos los ejercicios ordenados por 1RM estimado con medallas 🥇🥈🥉
- Búsqueda en tiempo real
- Compartir PR individual: `navigator.share` en móvil, copia al clipboard en desktop

### Peso Corporal (`/peso`)
- Registro de peso con fecha y nota opcional
- LineChart de evolución histórica
- Gráfica de evolución del 1RM estimado de los top 3 ejercicios (Epley) con múltiples líneas y leyenda
- Estadísticas: último peso, mínimo histórico, cambio total, tendencia
- Historial con indicadores de subida/bajada por registro
- Upsert por `(id_usuario, fecha)`: registrar el mismo día actualiza el valor
- Widget rápido de peso en el Dashboard

### Perfil
- Editar nombre inline (actualiza cookie de sesión)
- Subir foto de perfil (upload a Supabase Storage vía `/api/perfil/avatar`)
- Eliminar foto de perfil
- Exportar historial completo como CSV (descarga directa con todos los ejercicios y series)
- Acceso rápido a página de Peso Corporal

### Notificaciones Push
- Web Push API con claves VAPID — funciona aunque la pestaña esté cerrada
- Al activar: registro del service worker `/public/sw.js` + suscripción guardada en tabla `push_subscriptions` en Supabase
- Cron job Vercel (`vercel.json`) a medianoche UTC (7pm Colombia): llama `/api/push/send-racha`
  - Detecta usuarios con racha ≥ 3 días que no entrenaron hoy via función SQL `usuarios_racha_en_riesgo`
  - Envía notificación: "⚡ Tu racha de X días está en riesgo — Entrena hoy para mantenerla"
  - Limpia automáticamente suscripciones expiradas (HTTP 410/404)
- Botón toggle en Dashboard: "Activar notificaciones" / "Notificaciones activas"
- Respeta permiso del navegador; si fue denegado el botón se oculta

---

## Landing Page (`/`)

Página pública construida íntegramente con motion/react y CSS custom:

- **Nav**: glassmorphism al hacer scroll, botones "Iniciar sesión" (texto) y "Registrarse" (sólido azul acero)
- **Hero**: layout split 52/48, imagen full-bleed en móvil con overlay oscuro, cursor spotlight, 3 floating achievement cards animadas, CTAs magnéticos con spring physics. En móvil texto blanco sobre fondo oscuro
- **MarqueeStrip**: carrusel infinito de features (pausa al hover, deshabilitado en `prefers-reduced-motion`)
- **FeaturesGrid**: 6 cards con accent lines animadas al hover
- **ProductShowcase**: 3 secciones alternadas texto/imagen. Cada sección tiene un `<ProductShot>` — frame de teléfono 9:19.5 con notch, sombra multicapa y animación de float loop + lift al tap en móvil (via `useAnimation`)
- **WhySection**: sección oscura con 3 razones diferenciadas
- **FAQ**: 5 preguntas con acordeón animado (AnimatePresence + height transition)
- **FinalCTA**: sección de contraste oscuro con imagen de gym
- **Footer**: columnas App/Cuenta, newsletter con confirmación animada, redes sociales, WhatsApp, scroll-to-top
- **ScrollToTop**: botón discreto que aparece al bajar 600px con spring animation
- **CountUp**: números animados al entrar en viewport con `useInView`

Animaciones mobile-first: hero full-bleed, tarjetas notificación debajo del CTA, transición del formulario de login con `cardSlideDown 8s cubic-bezier(0.16,1,0.3,1)` en móvil.

---

## Componentes globales

| Componente | Descripción |
|------------|-------------|
| `LoadingBar` | Barra de progreso azul en la parte superior durante navegación |
| `OnboardingModal` | Modal de bienvenida en 4 pasos al hacer login |
| `PageTransition` | Slide lateral suave entre páginas con AnimatePresence (opacity + x: 14→0) |
| `PushNotifications` | Botón toggle suscripción push con registro de service worker |
| `ShareSessionCard` | Panel full-screen slide-from-bottom para previsualizar y descargar sesión como PNG |
| `Sidebar` | Navegación lateral con floating tooltip en hover sobre cada ítem |
| `MobileNav` | Navegación inferior para móvil |

---

## PWA

- `manifest.webmanifest` con `display: standalone`, `start_url: /dashboard`, `theme_color: #ffffff`
- Íconos generados con `next/og` (ImageResponse) en rutas `/icon-192` y `/icon-512` — lightning bolt SVG sobre fondo degradado azul
- `apple-icon` para iOS
- Service worker en `/public/sw.js`: maneja eventos `push` y `notificationclick`
- Instalable en iOS y Android sin App Store
- `viewportFit: cover` para notch/Dynamic Island

---

## Design System (Light Theme)

| Token | Valor | Uso |
|-------|-------|-----|
| `--surface-base` | `#ffffff` | Fondo principal |
| `--surface-card` | `#ffffff` | Cards |
| `--surface-raised` | `#f8f9fb` | Nav items, hover states |
| `--surface-deep` | `#f0f2f5` | Sidebar background |
| `--accent` | `#2d7fad` | Azul acero — acento principal |
| `--accent-dim` | `#e8f3fb` | Fondos tint azul |
| `--text-primary` | `#111318` | Texto principal (~18:1 contraste) |
| `--text-secondary` | `#4a5057` | Texto secundario (~7:1) |
| `--text-tertiary` | `#7a8290` | Labels, hints |
| `--text-disabled` | `#aab0ba` | Placeholders, deshabilitado |
| `--border-faint` | `#eceef2` | Bordes sutiles |
| `--border-subtle` | `#dde0e6` | Bordes de cards |
| `--success` | `#6dba8e` | Confirmaciones, PRs positivos |
| `--success-dim` | `oklch(0.94 0.04 155)` | Fondo success suave |
| `--error` | `#e05454` | Errores |
| `--error-dim` | `oklch(0.94 0.04 20)` | Fondo error suave |

**Fuente:** Lexend — 300 (body) / 500 (labels) / 600–700 (headings)  
**Radios:** `4px` (xs) · `6px` (sm) · `8px` (md) · `12px` (lg) · `16px` (xl)  
**Heatmap:** escala de 5 niveles OKLCH: `oklch(0.72 0.08 230)` → `oklch(0.43 0.21 230)`  
**Footer landing:** `#0d0f14` (dark, contraste intencional)

---

## Animaciones y micro-interacciones

| Feature | Implementación |
|---------|---------------|
| Transición entre páginas | AnimatePresence + `x: 14→0`, `opacity: 0→1`, 220ms |
| Slide-down login (móvil) | `@keyframes cardSlideDown 8s cubic-bezier(0.16,1,0.3,1)` |
| Float loop ProductShot | `useAnimation` loop `y: [0,-10,0]` cada 3.8s |
| Tap lift ProductShot | `y: -18, scale: 1.04` → rebote de vuelta |
| Check serie confirmada | `@keyframes serieCheck scale(0)→scale(1)` con spring 0.35s |
| Confetti al PR | 3 ráfagas canvas-confetti con delay 0 / 250ms / 400ms |
| Compartir sesión | Slide-from-bottom `translateY(100%)→0` 280ms |
| CountUp landing | `useInView` + animación de número 0→N durante 1.5s |
| Marquee strip | CSS `animation: marquee 36s linear infinite`, pausa en hover |
| Notificaciones push | Fade in botón + estado persistido en Supabase |

---

## API Endpoints

| Método | Endpoint | Descripción |
|--------|---------|-------------|
| GET | `/api/auth/google` | Redirige al consent screen de Google |
| GET | `/api/auth/google/callback` | Callback OAuth Google |
| POST | `/api/auth/login` | Login email/contraseña, set cookie 7 días |
| POST | `/api/auth/registro` | Crear cuenta + set cookie |
| POST | `/api/auth/logout` | Eliminar cookie de sesión |
| GET/POST | `/api/rutinas` | Listar / crear rutinas |
| GET/PUT/DELETE | `/api/rutinas/[id]` | Detalle / editar / eliminar rutina |
| POST | `/api/rutinas/[id]/duplicar` | Duplicar rutina con ejercicios |
| GET/POST/DELETE | `/api/ejercicios` | Listar / crear / eliminar ejercicios |
| PUT/DELETE | `/api/ejercicios/[id]` | Editar / eliminar ejercicio específico |
| GET/POST | `/api/sesiones` | Listar / crear sesiones |
| PUT/DELETE | `/api/sesiones/[id]` | Editar / eliminar sesión |
| GET/POST/DELETE | `/api/series` | CRUD de series dentro de sesión |
| PUT/DELETE | `/api/series/[id]` | Editar / eliminar serie específica |
| GET | `/api/historial` | Sesiones agrupadas con comparación vs anterior |
| GET | `/api/records` | PRs con 1RM estimado y evolución |
| GET | `/api/records/historico` | Histórico de pesos por ejercicio para gráfica |
| GET | `/api/dashboard` | Stats, heatmap 365 días, progreso, volumen |
| GET | `/api/progreso/ultimos-pesos` | Pesos de referencia de última sesión |
| GET/PUT | `/api/perfil` | Ver / actualizar nombre |
| POST/DELETE | `/api/perfil/avatar` | Subir / eliminar foto de perfil |
| GET | `/api/export` | Descargar historial completo como CSV |
| GET/POST/DELETE | `/api/peso-corporal` | Tracking de peso corporal |
| GET | `/api/peso/1rm` | Evolución 1RM top 3 ejercicios (Epley) |
| GET/PUT | `/api/descanso` | Días de descanso del usuario |
| POST/DELETE | `/api/push/subscribe` | Suscribir / cancelar suscripción push |
| GET | `/api/push/send-racha` | Cron: enviar notificación racha en riesgo |

---

## Base de datos

```sql
usuario           id_usuario uuid PK, nombre, email, password_hash, foto_perfil
rutina            id_rutina uuid PK, id_usuario FK, nombre, dia_semana, orden
ejercicio         id_ejercicio uuid PK, id_rutina FK, nombre, grupo_muscular, orden, num_series
sesion            id_sesion uuid PK, id_usuario FK, id_rutina FK, fecha, nota
serie             id_serie uuid PK, id_sesion FK, id_ejercicio FK, numero_serie,
                  peso_kg numeric, repeticiones int, rir int, notas text
peso_corporal     id uuid PK, id_usuario FK, fecha date, peso_kg numeric, notas text
                  UNIQUE(id_usuario, fecha)
push_subscriptions id uuid PK, id_usuario FK, endpoint text, p256dh text, auth text
                   UNIQUE(id_usuario, endpoint)
```

Función SQL requerida:
```sql
-- Detecta usuarios con racha ≥ 3 que no entrenaron hoy (para el cron de notificaciones)
CREATE OR REPLACE FUNCTION usuarios_racha_en_riesgo(p_fecha date)
RETURNS TABLE (id_usuario uuid, racha int) ...
```

> PK de usuario es `id_usuario` (no `id`). La DB siempre almacena pesos en kg; la conversión a lb es solo display. Colombia es UTC-5 siempre (sin horario de verano) — todas las fechas se calculan con este offset.

---

## Variables de entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=

# Cron security
CRON_SECRET=
```

---

## Cron Jobs (Vercel)

```json
// vercel.json
{
  "crons": [
    { "path": "/api/push/send-racha", "schedule": "0 0 * * *" }
  ]
}
```

`0 0 * * *` = medianoche UTC = **7pm Colombia (UTC-5)**  
El endpoint se protege con `Authorization: Bearer <CRON_SECRET>`.

---

## Estructura de archivos relevantes

```
src/
├── app/
│   ├── (main)/               # Layout autenticado (Sidebar + MobileNav + OnboardingModal)
│   │   ├── dashboard/        # Dashboard principal
│   │   ├── progreso/         # Registro de sesión
│   │   ├── historial/        # Historial de sesiones
│   │   ├── records/          # Récords personales y gráficas
│   │   ├── rutinas/          # Gestión de rutinas y ejercicios
│   │   ├── peso/             # Tracking de peso corporal
│   │   ├── perfil/           # Perfil de usuario
│   │   └── sesiones/[id]/    # Editar sesión
│   ├── api/                  # 27 endpoints REST
│   ├── login/                # Página de login (slide-down animation mobile)
│   ├── registro/             # Página de registro (misma animación que login)
│   ├── page.tsx              # Landing page pública
│   ├── layout.tsx            # Root layout con SEO / OG / PWA metadata
│   ├── globals.css           # Design system completo (tokens, keyframes, utilities)
│   └── manifest.ts           # PWA manifest
├── components/
│   ├── LoadingBar.tsx         # Barra de progreso global
│   ├── MobileNav.tsx          # Nav inferior móvil
│   ├── OnboardingModal.tsx    # Modal de bienvenida 4 pasos
│   ├── PageTransition.tsx     # AnimatePresence entre páginas
│   ├── PushNotifications.tsx  # Botón activar/desactivar push
│   ├── ShareSessionCard.tsx   # Card para compartir/descargar sesión como PNG
│   └── Sidebar.tsx            # Sidebar desktop con tooltips
├── lib/
│   ├── session.ts             # Leer cookie gym_session
│   └── supabase/              # Clientes Supabase (server + client)
├── hooks/
│   └── useIsMobile.ts
└── proxy.ts                   # Middleware de autenticación (no middleware.ts)

public/
├── sw.js                      # Service worker para push notifications
└── screenshots/               # Fotos para landing page
    ├── gym.jpg                # Hero
    ├── gym2.jpg               # Login / Registro
    ├── registro1.jpeg
    ├── records1.jpg
    └── dashboard1.jpg

supabase/
└── migrations/
    └── push_notifications.sql  # Tabla push_subscriptions + función SQL racha
```

---

## Correr localmente

```bash
git clone https://github.com/alejoramirez27/Progress-Gym-Tracker.git
cd Progress-Gym-Tracker
npm install

# Crear .env.local con las variables de entorno
npm run dev   # → http://localhost:3000
```

Ejecutar `supabase/migrations/push_notifications.sql` en el SQL Editor de Supabase para crear la tabla de notificaciones y la función de racha en riesgo.
