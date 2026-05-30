# VoltTrack — Progress Gym Tracker

Aplicación web privada para registrar y analizar el progreso en el gym. Diseñada con un sistema de diseño minimalista de precisión técnica, orientada a atletas que valoran los datos sobre el ruido.

**🔗 Deploy:** [progress-gym-tracker.vercel.app](https://progress-gym-tracker.vercel.app)

---

## Funcionalidades

- **Rutinas** — Crea y organiza rutinas por grupos musculares con tags de colores
- **Ejercicios** — Agrega ejercicios a cada rutina con descripción y orden
- **Series** — Registra cada serie con peso (kg), repeticiones, RIR y notas
- **Dashboard** — Métricas generales + gráfica de progreso de peso por ejercicio
- **Historial** — Todas las sesiones agrupadas por mes, expandibles por fecha

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Cookies HTTP-only con sesión propia |
| Gráficas | Recharts |
| Fuente | Lexend (Google Fonts) |
| Deploy | Vercel |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (main)/               # Páginas autenticadas (comparten sidebar)
│   │   ├── rutinas/          # Lista de rutinas + detalle con ejercicios
│   │   ├── dashboard/        # Métricas y gráfica de progreso
│   │   └── historial/        # Sesiones agrupadas por fecha
│   ├── api/
│   │   ├── auth/             # Login y logout
│   │   ├── rutinas/          # CRUD rutinas
│   │   ├── ejercicios/       # CRUD ejercicios por rutina
│   │   ├── series/           # Registro de series
│   │   ├── dashboard/        # Stats + datos para la gráfica
│   │   └── historial/        # Sesiones y detalle por fecha
│   └── login/                # Página de inicio de sesión
├── components/
│   └── Sidebar.tsx           # Navegación lateral
└── lib/
    ├── session.ts            # Helper para leer cookie de sesión
    └── supabase/             # Cliente Supabase (server)
```

---

## Base de datos (Supabase)

```
usuario       → id, nombre, email, password_hash
rutina        → id, id_usuario, nombre, descripcion, grupos
ejercicio     → id, id_rutina, nombre, descripcion, orden
serie         → id, id_ejercicio, fecha, numero_serie, peso_kg, repeticiones, rir, descanso_seg, notas
```

---

## Sistema de diseño — VoltTrack

Basado en el sistema **Kinetic Performance** con paleta Dark Mode:

| Token | Color | Uso |
|---|---|---|
| `surface` | `#111318` | Fondo principal |
| `surface-container` | `#1e2024` | Cards y contenedores |
| `primary` | `#b1c9e1` | Slate Blue — acento principal |
| `on-surface` | `#e2e2e8` | Texto principal |
| `outline` | `#43474c` | Bordes y separadores |

Fuente: **Lexend** — peso 300 (body), 500 (labels), 600 (headlines)

---

## Correr localmente

```bash
# Clonar el repositorio
git clone https://github.com/alejoramirez27/Progress-Gym-Tracker.git
cd Progress-Gym-Tracker

# Instalar dependencias
npm install

# Variables de entorno (crear .env.local)
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Correr en desarrollo
npm run dev
```

---

## Repositorio

[github.com/alejoramirez27/Progress-Gym-Tracker](https://github.com/alejoramirez27/Progress-Gym-Tracker)
