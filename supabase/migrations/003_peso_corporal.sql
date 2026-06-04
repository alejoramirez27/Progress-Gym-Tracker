-- Tabla para rastreo de peso corporal
-- Ejecutar en Supabase SQL Editor

create table if not exists public.peso_corporal (
  id          uuid primary key default gen_random_uuid(),
  id_usuario  uuid not null references public.usuario(id_usuario) on delete cascade,
  fecha       date not null,
  peso_kg     numeric(5,2) not null check (peso_kg > 0 and peso_kg < 500),
  notas       text,
  created_at  timestamptz default now(),

  -- Solo un registro por usuario por día (upsert)
  unique (id_usuario, fecha)
);

-- RLS
alter table public.peso_corporal enable row level security;

create policy "usuarios ven su propio peso"
  on public.peso_corporal for all
  using (id_usuario = (select id_usuario from public.usuario where id_usuario = auth.uid()));

-- Índice para queries por usuario+fecha
create index if not exists peso_corporal_usuario_fecha
  on public.peso_corporal (id_usuario, fecha desc);
