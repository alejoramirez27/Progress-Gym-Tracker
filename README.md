# VoltTrack — Gym Performance Tracker

> Registra cada serie, calcula tus PRs automáticamente y visualiza 365 días de progreso.  
> Gratis para siempre. Sin anuncios. Sin límites.

**🔗 Live:** [progress-gym-tracker.vercel.app](https://progress-gym-tracker.vercel.app)  
**📁 Repo:** [github.com/alejoramirez27/Progress-Gym-Tracker](https://github.com/alejoramirez27/Progress-Gym-Tracker)

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript |
| Base de datos | Supabase (PostgreSQL + RLS) |
| Estilos | CSS Variables custom + Tailwind base |
| Animaciones | motion/react (Motion v12) |
| Gráficas | Recharts (LineChart, BarChart, AreaChart) |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Fuente | Lexend (Google Fonts) |
| Deploy | Vercel |

---

## Funcionalidades

### Auth
- Login / Registro con email y contraseña
- Continuar con Google (OAuth)
- Sesión via cookie HTTP-only `gym_session` (7 días)
- Middleware de protección en `src/proxy.ts` (no `middleware.ts`)
- Aislamiento multi-usuario — cada usuario solo ve sus propios datos

### Rutinas
- CRUD completo de rutinas con día de semana asignado
- Reordenar rutinas con **drag & drop** (mouse + táctil)
- **Duplicar rutina** — copia completa con todos sus ejercicios
- Ejercicios con autocompletado desde banco de 60+ movimientos en 9 grupos musculares
- Reordenar ejercicios con drag & drop dentro de cada rutina

### Progreso (registro de sesión)
- Selección de rutina + **date picker personalizado** (diseño propio, sin picker nativo del OS)
- **Pesos anteriores como placeholder** — la última sesión de esa rutina aparece de referencia automáticamente
- Series dinámicas: agrega o elimina en tiempo real; la última se copia como base
- **Toggle kg/lb por ejercicio** — cada ejercicio puede estar en unidades distintas; al cambiar, los valores se convierten automáticamente
- Notas por serie (toggle show/hide por ejercicio)
- Bloqueo de cierre + modal de confirmación con datos sin guardar
- **Repetir sesión**: carga plantilla de sesión anterior desde Historial
- **Resumen post-sesión**: al guardar muestra total de series, volumen en kg y nuevos PRs detectados

### Dashboard
- 4 métricas: rutinas, ejercicios, series totales, última sesión
- 3 métricas de actividad: racha actual / mejor racha / esta semana
- **Widget de peso corporal** con sparkline de 7 días y registro rápido
- **Heatmap de 365 días** estilo GitHub — celdas clickeables que navegan al historial
- Dual chart tabs: *Progreso peso* (LineChart filtrable por rutina/ejercicio) + *Volumen total* (BarChart últimas 30 sesiones)
- Nota del día guardada en `localStorage`

### Historial
- Sesiones agrupadas por mes con búsqueda en tiempo real
- Expandible: ver todos los ejercicios y series de cada sesión
- **Comparar vs. sesión anterior**: `+X kg` / `-X kg` por ejercicio con icono de tendencia
- Editar sesión (reemplaza series, preserva fecha)
- Botón ↺ Repetir para precargar la sesión en Progreso

### Récords Personales (PRs)
- Peso máximo histórico por ejercicio agrupado por rutina
- **1RM estimado** con fórmula Epley: `peso × (1 + reps / 30)`
- Evolución `+X kg` desde el primer registro (chip verde)
- Vista "Top 1RM" — ranking plano con medallas 🥇🥈🥉
- Búsqueda en tiempo real
- **Compartir PR**: `navigator.share` en móvil, clipboard fallback en desktop

### Peso Corporal
- Página dedicada `/peso` con LineChart de evolución
- Historial con indicadores de tendencia (subida/bajada por registro)
- Estadísticas: último peso, mínimo histórico, cambio total
- Widget rápido en el Dashboard
- API: GET últimos 90 registros, POST upsert por `(id_usuario, fecha)`, DELETE

### Perfil
- Editar nombre inline (actualiza cookie de sesión)
- Exportar historial completo como CSV (descarga directa)
- Acceso rápido a página de Peso Corporal

---

## Landing Page

Página pública en `/` construida con `motion/react`:

- **Nav** — glassmorphism al scroll, botones "Iniciar sesión" (texto) + "Registrarse" (sólido azul)
- **Hero** — split 52/48, imagen parallax, cursor spotlight, 3 floating achievement cards, magnetic CTAs con spring physics
- **MarqueeStrip** — carrusel infinito de features (pausa al hover)
- **FeaturesGrid** — 6 cards con accent lines animadas
- **ProductShowcase** — 3 secciones alternadas con `<ProductShot>`: frame de teléfono 9:19.5 con sombra y notch. Placeholders SVG en `/public/screenshots/` (pendiente reemplazar por PNGs reales)
- **Stats** — 3 métricas con `CountUp` animado al entrar en viewport, color unificado `#2d7fad`
- **WhySection** — 3 razones (reducido de 6, eliminando redundancia)
- **FAQ** — 5 preguntas con acordeón animado
- **FinalCTA** — sección oscura de contraste con imagen de gym
- **Footer** — columnas App/Cuenta + newsletter con confirmación + redes sociales
- **ScrollToTop** — botón discreto que aparece al bajar 600px
- **`SectionHeader`** — componente compartido para encabezados: grid 7/5 col en desktop, `items-end`, tipografía legible (contraste WCAG AA `#374151`)

---

## Design System (Light Theme)

| Token | Valor | Uso |
|-------|-------|-----|
| `--surface-base` | `#ffffff` | Fondo principal |
| `--surface-card` | `#ffffff` | Cards |
| `--surface-raised` | `#f8f9fb` | Nav items, hover |
| `--surface-deep` | `#f0f2f5` | Sidebar background |
| `--accent` | `#2d7fad` | Azul acero — acento principal |
| `--accent-dim` | `#e8f3fb` | Fondos tint azul |
| `--text-primary` | `#111318` | Texto principal (~18:1 contraste) |
| `--text-secondary` | `#4a5057` | Texto secundario (~7:1) |
| `--text-tertiary` | `#7a8290` | Labels, hints |
| `--border-faint` | `#eceef2` | Bordes sutiles |
| `--border-subtle` | `#dde0e6` | Bordes de cards |
| `--success` | `#6dba8e` | Confirmaciones |
| `--error` | `#e05454` | Errores |

**Fuente:** Lexend — 300 (body) / 500 (labels) / 600–700 (headings)  
**Radios:** `4px` (xs) · `6px` (sm) · `8px` (md) · `12px` (lg) · `16px` (xl)  
**Footer:** `#0d0f14` (dark, contraste intencional al final de landing)

---

## PWA

- `manifest.webmanifest` con `display: standalone`, `start_url: /dashboard`
- Íconos generados con `next/og` (`ImageResponse`) — lightning bolt SVG
- `theme-color: #ffffff`, `viewportFit: cover`
- Zoom accesible: no `maximum-scale` ni `user-scalable=no` (WCAG)
- Instalable en iOS y Android sin App Store

---

## Open Graph / SEO

```ts
// src/app/layout.tsx
openGraph: {
  title: 'VoltTrack — Entrena con intención',
  description: 'Registra pesos, sigue tus PRs y visualiza 365 días...',
  // TODO: descomentar cuando suba og-image.png real (1200×630)
  // images: [{ url: '/og/og-image.png', width: 1200, height: 630 }],
}
```

---

## Imágenes y rendimiento

- `next/image` con `formats: ['image/avif', 'image/webp']` en `next.config.ts`
- `priority` solo en imagen hero; `loading="lazy"` en el resto
- `remotePatterns` configurado para `images.unsplash.com`

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
| GET/POST/DELETE | `/api/ejercicios` | CRUD ejercicios |
| GET/POST | `/api/sesiones` | Listar / crear sesiones |
| PUT/DELETE | `/api/sesiones/[id]` | Editar / eliminar sesión |
| GET | `/api/historial` | Sesiones con comparación anterior |
| GET | `/api/records` | PRs con 1RM y evolución |
| GET | `/api/dashboard` | Stats, heatmap, progreso, volumen |
| GET | `/api/progreso/ultimos-pesos` | Referencia pesos última sesión |
| GET/PUT | `/api/perfil` | Ver / actualizar perfil |
| GET | `/api/export` | Descargar historial CSV |
| GET/POST/DELETE | `/api/peso-corporal` | Tracking de peso corporal |

---

## Base de datos

```sql
usuario       id_usuario uuid PK, nombre, email, password_hash
rutina        id_rutina uuid PK, id_usuario FK, nombre, dia_semana, orden
ejercicio     id_ejercicio uuid PK, id_rutina FK, nombre, grupo_muscular, orden, num_series
sesion        id_sesion uuid PK, id_usuario FK, id_rutina FK, fecha, nota
serie         id_serie uuid PK, id_sesion FK, id_ejercicio FK, peso_kg, repeticiones, rir, notas, numero_serie
peso_corporal id uuid PK, id_usuario FK, fecha date, peso_kg numeric — UNIQUE(id_usuario, fecha)
```

> PK de usuario es `id_usuario` (no `id`). DB siempre almacena en kg — conversión a lb es solo display.

---

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
COOKIE_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=
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

---

## Pendiente

- [ ] Screenshots reales → `public/screenshots/{registro,records,dashboard}.png`
- [ ] og-image.png real (1200×630) → `public/og/og-image.png` + descomentar en `layout.tsx`
- [ ] Links reales de redes sociales en footer
- [ ] Comparar sesión vs anterior en Historial (diff por ejercicio)
- [ ] Gráfica de progreso por ejercicio en PRs (sparkline temporal)
- [ ] Notas rápidas por sesión (campo libre al guardar)
- [ ] Volumen semanal acumulado en Dashboard
- [ ] 1RM con gráfica de evolución en página de Peso
- [ ] Filtro por grupo muscular en Historial
- [ ] Rutinas con drag & drop para reordenar ejercicios
- [ ] Templates de rutina (Push/Pull/Legs, Fullbody 3x, etc.)
- [ ] Micro-animaciones al guardar serie (check con rebote)
- [ ] PR celebration (glow/confeti al detectar nuevo récord)
- [ ] Transiciones entre páginas (AnimatePresence)
- [ ] Modo offline / Service Worker
- [ ] Notificación de racha en riesgo (push notification)
