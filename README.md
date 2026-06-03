# VoltTrack — Gym Performance Tracker

Aplicación web PWA para registrar y analizar el progreso en el gym. Sin suscripciones, sin anuncios, sin distracciones — solo tú y tus números.

**🔗 Live:** [progress-gym-tracker.vercel.app](https://progress-gym-tracker.vercel.app)  
**📁 Repo:** [github.com/alejoramirez27/Progress-Gym-Tracker](https://github.com/alejoramirez27/Progress-Gym-Tracker)

---

## Funcionalidades

### 🔐 Autenticación
- Login con email y contraseña
- Registro de cuenta nueva con validación en tiempo real
- Cookie HTTP-only de 7 días (`gym_session`)
- Proxy de protección de rutas — redirige a `/login` sin sesión activa
- Logout con redirección completa (`window.location.href`) para limpiar cookie

---

### 🏋️ Rutinas
- Crea rutinas con nombre y día de semana asignado
- Reordena rutinas con **drag & drop** (mouse y táctil/móvil) usando `@dnd-kit`
- Edita y elimina rutinas desde la lista o desde el detalle
- **Duplicar rutina** — copia la rutina completa con todos sus ejercicios en un clic
- Las rutinas se muestran ordenadas por día de semana (Lunes → Domingo)
- **Onboarding de 3 pasos** cuando no hay ninguna rutina creada — guía al usuario desde cero

#### Ejercicios dentro de rutinas
- Agrega ejercicios con nombre y número de series planificadas
- Reordena ejercicios con drag & drop dentro de cada rutina
- Edita nombre y número de series por ejercicio inline
- **Banco de ejercicios**: autocompletado con más de 60 ejercicios en 9 grupos musculares (pecho, espalda, piernas, hombros, bíceps, tríceps, abdomen, glúteos, cardio)
- `<datalist>` nativo con todos los ejercicios del banco

---

### 💪 Progreso *(registro de sesión)*
- Selecciona la rutina del día y la fecha
- **Pesos anteriores como placeholder** — los inputs muestran en gris el peso y reps de la última sesión para esa rutina, sin tener que recordar ni buscar
- Chip `↩ X kg` visible en el header de cada ejercicio como referencia rápida
- **Series dinámicas**: agrega o elimina series en tiempo real; al agregar, la última serie se copia automáticamente como base
- **Notas por serie**: toggle por ejercicio para mostrar/ocultar campo de nota individual
- **Timer de descanso** integrado: opciones 1m / 1.5m / 2m / 3m, se auto-inicia en 90s al abrir, alerta con toast al terminar
- Banner de advertencia cuando hay series sin guardar
- **Modal de confirmación** al intentar salir con datos sin guardar
- Bloqueo del cierre del navegador si hay datos sin guardar (`beforeunload`)
- **Repetir sesión**: carga la plantilla de pesos/reps de una sesión anterior (iniciado desde Historial)
- **Animación de celebración** al guardar exitosamente: confetti + animación pop en el ícono de check + slide-up del texto

---

### 📊 Dashboard
- **4 métricas superiores**: rutinas totales, ejercicios totales, series acumuladas, última sesión (con formato de fecha apropiado)
- **3 métricas de actividad** en grid simétrico: Racha actual / Mejor racha / Esta semana
- Comparación automática semana actual vs. semana pasada
- **Widget de días de la semana** (L M X J V S D): círculos con dot de acento en días entrenados, borde de acento en el día de hoy
- **Heatmap de 365 días** estilo GitHub — columnas = semanas (lunes a domingo), filas = días; alineado al lunes de la semana actual
  - Colores: sin actividad / 1 sesión / 2+ sesiones
  - Etiquetas de mes sobre el grid
  - Etiquetas de día (L/M/X/J/V/S/D) a la izquierda
  - **Celdas clickeables** — al hacer clic en un día con actividad navega al historial
  - Hover scale en celdas activas
  - Scroll horizontal en móvil
  - Contador total de sesiones en el año
- **Dual chart tabs**:
  - *Progreso peso*: `LineChart` con peso máximo por sesión, filtrable por rutina y ejercicio en cascada
  - *Volumen total*: `BarChart` con volumen acumulado (kg × reps) por fecha, últimas 30 sesiones
- **Nota del día**: textarea guardada en `localStorage` con clave `nota_dia_YYYY-MM-DD`, ubicada al final del dashboard

---

### 📋 Historial
- Sesiones agrupadas por mes, ordenadas por fecha descendente
- Cada sesión muestra: fecha, nombre de rutina, cantidad de ejercicios y series
- **Búsqueda** en tiempo real por nombre de rutina o fecha formateada
- Expandible: ver todos los ejercicios y series de esa sesión con pesos y reps
- **Comparación vs. sesión anterior**: al expandir, cada ejercicio muestra `+X kg` o `-X kg` respecto a la sesión anterior de la misma rutina, con ícono TrendingUp/TrendingDown
- **Botón ↺ Repetir**: guarda la plantilla de esa sesión en `localStorage` y navega a Progreso para precargarla
- **Editar sesión**: abre la sesión en modo edición, actualiza series (DELETE + re-INSERT), preserva la fecha original
- Eliminar sesión con confirmación

---

### 🏆 Récords Personales (PRs)
- Vista dedicada con el peso máximo histórico por ejercicio
- Agrupados por rutina (ordenados por día de semana), **todos cerrados por defecto**
- **1RM estimado** con fórmula Epley: `Math.round(peso × (1 + reps / 30))`
- **Evolución del PR**: muestra `+X kg` desde el primer registro del ejercicio (chip verde)
- **Búsqueda** de ejercicios en tiempo real
- **Vista "Top 1RM"**: ranking plano de todos los ejercicios ordenados por 1RM estimado, con medallas 🥇🥈🥉
- **Compartir PR**: usa `navigator.share` en móvil; fallback a `navigator.clipboard` en desktop. Genera texto con peso, reps, 1RM y fecha
- Contador `X/Y con PR` por rutina

---

### 👤 Perfil
- Muestra nombre y email del usuario
- **Editar nombre** inline con guardado en la tabla `usuario` (PUT /api/perfil) y refresco de la cookie de sesión
- **Exportar historial a CSV** — descarga directa (`Content-Disposition: attachment`) con todas las series del usuario, con fecha formateada en el nombre del archivo

---

### 🌐 Landing Page
Página pública con animaciones avanzadas usando `motion/react` (Motion v12):

- **Nav** con efecto glass que aparece al hacer scroll
- **Hero**: split layout 52/48 con imagen parallax, cursor spotlight que sigue el mouse, 3 tarjetas flotantes de logros animadas (PR / Racha / Progreso), chip badge animado, indicador "Desliza para explorar" con anillo pulsante
- **Botones magnéticos**: CTAs que se mueven hacia el cursor con spring physics
- **MarqueeStrip**: carrusel horizontal infinito de features, pausa al hover
- **FeaturesGrid**: 9 cards en 3 columnas con accent line animada, números 01–09, hover `-4px`
- **FeatureEditorial**: foto full-bleed con texto sobre degradado
- **2× FeatureSplit**: "Récords automáticos" y "Progreso visual" con bullets y hover scale en imagen
- **Stats**: 3 métricas con contadores animados `CountUp` (easing cúbico, se activan al entrar en viewport)
- **Process**: 3 pasos con números grandes semitransparentes, hover `translateX`
- **WhySection**: 6 razones en grid 3×2 con accent lines y hover rotate en íconos
- **FinalCTA**: imagen de gym con overlay y glow radial, headline de dos líneas
- Todas las secciones con `whileInView` animations (fade-up + line-reveal)
- Responsive completo: 1 columna en móvil, 2 en tablet, 3 en desktop

---

### 🔄 UI Global
- **Barra de carga** fina de 2px en el top de la pantalla durante cada navegación — anima de 0% a 100% con glow amarillo al cambiar de página
- Toasts con `sonner` para feedback de éxito/error en todas las acciones
- Esqueletos de carga (`className="skeleton"`) en todas las secciones mientras cargan datos
- **Sidebar** (desktop): logo + 5 secciones + cerrar sesión con hover rojo
- **MobileNav** (móvil): top bar con logo + logout, bottom nav con 6 secciones
- Todas las páginas con animación de entrada `page-enter`

---

## API Endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Login con email/contraseña |
| POST | `/api/auth/registro` | Crear cuenta |
| POST | `/api/auth/logout` | Cerrar sesión (borra cookie) |
| GET | `/api/rutinas` | Listar rutinas del usuario |
| POST | `/api/rutinas` | Crear rutina |
| PUT | `/api/rutinas/[id]` | Editar rutina |
| DELETE | `/api/rutinas/[id]` | Eliminar rutina + ejercicios |
| POST | `/api/rutinas/[id]/duplicar` | Duplicar rutina con todos sus ejercicios |
| GET | `/api/ejercicios?id_rutina=` | Listar ejercicios de una rutina |
| POST | `/api/ejercicios` | Crear ejercicio |
| PUT | `/api/ejercicios/[id]` | Editar ejercicio |
| DELETE | `/api/ejercicios/[id]` | Eliminar ejercicio |
| GET | `/api/sesiones` | Listar sesiones del usuario |
| POST | `/api/sesiones` | Crear sesión con todas sus series |
| PUT | `/api/sesiones/[id]` | Editar sesión (reemplaza series) |
| DELETE | `/api/sesiones/[id]` | Eliminar sesión y series |
| GET | `/api/historial` | Sesiones agrupadas con detalle expandible y comparación anterior |
| GET | `/api/records` | PRs por ejercicio con `primer_peso` para calcular evolución |
| GET | `/api/dashboard` | Stats, heatmap 365 días, progreso por ejercicio, volumen |
| GET | `/api/progreso/ultimos-pesos?id_rutina=` | Pesos/reps de la última sesión por rutina |
| GET | `/api/perfil` | Datos del usuario |
| PUT | `/api/perfil` | Actualizar nombre + refrescar cookie |
| GET | `/api/export` | Exporta historial completo como CSV |

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Cookies HTTP-only |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Animaciones | motion/react (Motion v12) |
| Gráficas | Recharts (LineChart + BarChart) |
| Notificaciones | sonner (toasts) |
| Fuente | Lexend (Google Fonts) |
| Deploy | Vercel |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (main)/                     # Páginas autenticadas
│   │   ├── layout.tsx              # Shell con Sidebar + MobileNav + LoadingBar
│   │   ├── rutinas/
│   │   │   ├── page.tsx            # Lista con drag&drop + onboarding + duplicar
│   │   │   └── [id]/page.tsx       # Detalle: ejercicios, edición, banco, autocomplete
│   │   ├── progreso/
│   │   │   └── page.tsx            # Registro: series dinámicas, timer, placeholders, celebración
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Heatmap 365d, racha, dots semana, charts duales, nota
│   │   ├── historial/
│   │   │   └── page.tsx            # Búsqueda, comparar vs anterior, repetir, editar
│   │   ├── records/
│   │   │   └── page.tsx            # PRs, 1RM, evolución, ranking, compartir
│   │   └── perfil/
│   │       └── page.tsx            # Editar nombre + exportar CSV
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── registro/route.ts
│   │   ├── rutinas/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── duplicar/route.ts   # ← nuevo
│   │   ├── ejercicios/route.ts
│   │   ├── sesiones/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts           # PUT (editar) + DELETE
│   │   ├── historial/route.ts          # con comparación anterior
│   │   ├── records/route.ts            # con primer_peso para evolución
│   │   ├── dashboard/route.ts          # heatmap 365d + stats racha
│   │   ├── progreso/
│   │   │   └── ultimos-pesos/route.ts  # ← nuevo: placeholders de pesos
│   │   ├── perfil/route.ts             # ← nuevo: GET + PUT
│   │   └── export/route.ts             # ← nuevo: CSV download
│   ├── page.tsx                        # Landing page pública
│   ├── login/page.tsx
│   └── registro/page.tsx
├── components/
│   ├── Sidebar.tsx                     # Nav desktop
│   ├── MobileNav.tsx                   # Top bar + bottom nav móvil
│   └── LoadingBar.tsx                  # ← nuevo: barra de progreso de navegación
├── lib/
│   ├── session.ts
│   └── supabase/server.ts
└── proxy.ts                            # Protección de rutas (Next.js 16)
```

---

## Base de datos (Supabase)

```sql
usuario
  id_usuario  uuid PRIMARY KEY
  nombre      text
  email       text UNIQUE
  password_hash text

rutina
  id_rutina   uuid PRIMARY KEY
  id_usuario  uuid FK → usuario
  nombre      text
  dia_semana  text   -- 'Lunes' | 'Martes' | ... | 'Domingo' | null
  orden       int
  created_at  timestamptz

ejercicio
  id_ejercicio  uuid PRIMARY KEY
  id_rutina     uuid FK → rutina
  nombre        text
  orden         int
  num_series    int
  created_at    timestamptz

sesion
  id_sesion   uuid PRIMARY KEY
  id_rutina   uuid FK → rutina
  id_usuario  uuid FK → usuario
  fecha       date
  notas       text
  created_at  timestamptz

serie
  id_serie      uuid PRIMARY KEY
  id_ejercicio  uuid FK → ejercicio
  id_sesion     uuid FK → sesion
  fecha         date
  numero_serie  int
  peso_kg       numeric
  repeticiones  int
  rir           int
  notas         text
```

---

## Variables de entorno

```bash
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

---

## Correr localmente

```bash
git clone https://github.com/alejoramirez27/Progress-Gym-Tracker.git
cd Progress-Gym-Tracker
npm install

# Crear .env.local con las credenciales de Supabase
npm run dev
# → http://localhost:3000
```

---

## Sistema de diseño

| Token | Color | Uso |
|---|---|---|
| `--surface-deep` | `#0c0e12` | Fondo principal |
| `--surface-card` | `#14171c` | Cards |
| `--surface-raised` | `#1c1f26` | Hover, botones secundarios |
| `--accent` | `#b1c9e1` | Slate Blue — acento principal |
| `--text-primary` | `#e2e2e8` | Texto principal |
| `--text-secondary` | `#9199a3` | Texto secundario |
| `--text-tertiary` | `#636870` | Labels, hints |
| `--success` | `#4caf82` | Confirmaciones |
| `--warning` | `#e0a840` | Advertencias |
| `--error` | `#e05555` | Errores |

**Fuente:** Lexend — weight 300 (body) · 500 (labels) · 600–700 (headings)  
**Radios:** `4px` (xs) · `6px` (sm) · `8px` (md) · `12px` (lg) · `16px` (xl)

---

## Herramientas de desarrollo

| Herramienta | Uso |
|---|---|
| **Claude Code** | Arquitectura, código completo, debugging y refactors |
| **Google Stitch** | Diseño UI/UX — sistema de diseño VoltTrack, paleta y layouts |
