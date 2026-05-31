# VoltTrack — Progress Gym Tracker

Aplicación web privada para registrar y analizar el progreso en el gym. Diseñada con el sistema de diseño **VoltTrack / Kinetic Performance** — minimalismo de precisión técnica orientado a atletas que valoran los datos sobre el ruido.

**🔗 Deploy:** [progress-gym-tracker.vercel.app](https://progress-gym-tracker.vercel.app)  
**📁 Repositorio:** [github.com/alejoramirez27/Progress-Gym-Tracker](https://github.com/alejoramirez27/Progress-Gym-Tracker)

---

## Funcionalidades

### Rutinas
- Crea rutinas con nombre, grupos musculares, descripción y día de la semana asignado
- Reordena rutinas con drag & drop (mouse y táctil/móvil)
- Edita y elimina rutinas desde la lista o desde el detalle
- Las rutinas se muestran ordenadas por día de semana (Lunes → Domingo)

### Ejercicios
- Agrega ejercicios a cada rutina con número de series planificadas
- Reordena ejercicios con drag & drop dentro de la rutina
- Edita nombre y número de series por ejercicio inline

### Progreso *(sección principal de entrenamiento)*
- Selecciona la rutina del día y la fecha
- Los ejercicios aparecen con sus slots de series pre-configurados (según las series planificadas)
- Llena peso (kg), repeticiones y RIR por cada serie
- Guarda la sesión completa en un solo clic → queda registrada en el historial

### Dashboard
- 4 métricas: total rutinas, ejercicios, series acumuladas, última sesión
- Gráfica de progreso de peso máximo por ejercicio
- Filtro en cascada: selecciona rutina → filtra ejercicios de esa rutina → muestra evolución
- Rutinas ordenadas por día de semana en el selector
- Responsive: 2×2 en móvil, 4 columnas en desktop

### Historial
- Sesiones agrupadas por mes, ordenadas por fecha
- Cada sesión muestra: fecha, nombre de rutina, conteo de ejercicios y series
- Expandible: ver todos los pesos y reps registrados en esa sesión
- Elimina sesiones directamente desde el historial

### Autenticación
- Login con cookie HTTP-only de 7 días
- Middleware de protección de rutas (redirige a /login si no hay sesión)

### Diseño responsive
- Sidebar en desktop · Barra inferior + top bar en móvil
- Layout se adapta en < 768px con `useIsMobile` hook

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Cookies HTTP-only con sesión propia |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Gráficas | Recharts |
| Fuente | Lexend (Google Fonts) |
| Deploy | Vercel |

---

## Herramientas de desarrollo

| Herramienta | Uso |
|---|---|
| **Claude Code** | Agente de IA — arquitectura, código, debugging y refactors completos |
| **Google Stitch** | Diseño de UI/UX — sistema de diseño VoltTrack, paleta, tipografía y layouts |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (main)/               # Páginas autenticadas (comparten sidebar + layout)
│   │   ├── rutinas/          # Lista de rutinas con drag & drop
│   │   │   └── [id]/         # Detalle: ejercicios, edición, reorden
│   │   ├── progreso/         # Registro de sesión del día
│   │   ├── dashboard/        # Métricas + gráfica de progreso
│   │   └── historial/        # Sesiones agrupadas por mes
│   ├── api/
│   │   ├── auth/             # Login y logout
│   │   ├── rutinas/          # CRUD + reorden
│   │   ├── ejercicios/       # CRUD + reorden + num_series
│   │   ├── sesiones/         # Crear, listar y eliminar sesiones
│   │   ├── series/           # CRUD series individuales
│   │   ├── dashboard/        # Stats + datos gráfica ordenados por día
│   │   └── historial/        # Sesiones con detalle expandible
│   └── login/
├── components/
│   ├── Sidebar.tsx           # Nav desktop (clickear logo → /rutinas)
│   └── MobileNav.tsx         # Top bar + bottom nav para móvil
├── hooks/
│   └── useIsMobile.ts        # Detecta breakpoint < 768px
└── lib/
    ├── session.ts            # Lee cookie gym_session
    └── supabase/             # Cliente con service_role_key
```

---

## Base de datos (Supabase)

```
usuario
  id_usuario, nombre, email, password_hash

rutina
  id_rutina, id_usuario, nombre, descripcion, grupos,
  dia_semana, orden, created_at

ejercicio
  id_ejercicio, id_rutina, nombre, descripcion,
  orden, num_series, created_at

sesion
  id_sesion, id_rutina, id_usuario, fecha, notas, created_at

serie
  id_serie, id_ejercicio, id_sesion (FK → sesion),
  fecha, numero_serie, peso_kg, repeticiones,
  rir, descanso_seg, notas
```

---

## Sistema de diseño — VoltTrack

Basado en el sistema **Kinetic Performance** diseñado en Google Stitch:

| Token | Color | Uso |
|---|---|---|
| `surface` | `#111318` | Fondo principal |
| `surface-container` | `#1e2024` | Cards y contenedores |
| `surface-container-high` | `#282a2e` | Inputs y hover |
| `primary` | `#b1c9e1` | Slate Blue — acento principal |
| `on-surface` | `#e2e2e8` | Texto principal |
| `on-surface-variant` | `#8d9197` | Texto secundario |
| `outline` | `#43474c` | Bordes y separadores |

Fuente: **Lexend** — peso 300 (body), 500 (labels/nav), 600 (headlines)  
Radio de bordes: 8px componentes · 12px cards · 16px contenedores grandes

---

## Correr localmente

```bash
git clone https://github.com/alejoramirez27/Progress-Gym-Tracker.git
cd Progress-Gym-Tracker
npm install

# Crear .env.local con las credenciales de Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

npm run dev
```
