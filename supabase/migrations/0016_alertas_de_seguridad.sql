-- alertas automáticas de seguridad: un posible choque detectado por el teléfono de quien viaja
create table if not exists public.alertas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users (id),
  viaje_id text,
  tipo text not null default 'choque' check (tipo in ('choque', 'manual')),
  lat double precision,
  lng double precision,
  nombre text,
  atendida boolean not null default false,
  creada_en timestamptz not null default now()
);

alter table public.alertas enable row level security;

drop policy if exists "cada quien manda sus alertas" on public.alertas;
create policy "cada quien manda sus alertas" on public.alertas
  for insert with check (usuario_id = auth.uid());

drop policy if exists "cada quien ve sus alertas" on public.alertas;
create policy "cada quien ve sus alertas" on public.alertas
  for select using (usuario_id = auth.uid());
