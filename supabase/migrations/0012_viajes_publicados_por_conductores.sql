-- los viajes los publican los conductores; los pasajeros los ven en toda la app
create table if not exists public.viajes (
  id text primary key,
  chofer_id text not null,
  ruta_id text not null,
  servicio text not null check (servicio in ('ordinario', 'expreso')),
  placa text not null,
  anden integer not null check (anden between 1 and 99),
  salida timestamptz not null,
  estado text not null default 'programado',
  creado_en timestamptz not null default now()
);

create index if not exists viajes_salida_idx on public.viajes (salida);
create index if not exists viajes_chofer_idx on public.viajes (chofer_id);

alter table public.viajes enable row level security;

drop policy if exists "todos ven los viajes" on public.viajes;
create policy "todos ven los viajes" on public.viajes for select using (true);

drop policy if exists "el conductor publica sus viajes" on public.viajes;
create policy "el conductor publica sus viajes" on public.viajes for insert with check (
  exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and p.rol = 'conductor' and p.chofer_id = viajes.chofer_id
  )
);

drop policy if exists "el conductor edita sus viajes" on public.viajes;
create policy "el conductor edita sus viajes" on public.viajes for update using (
  exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and p.rol = 'conductor' and p.chofer_id = viajes.chofer_id
  )
) with check (
  exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and p.rol = 'conductor' and p.chofer_id = viajes.chofer_id
  )
);

drop policy if exists "el conductor borra sus viajes" on public.viajes;
create policy "el conductor borra sus viajes" on public.viajes for delete using (
  exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and p.rol = 'conductor' and p.chofer_id = viajes.chofer_id
  )
);

-- asientos vendidos de todos los viajes de hoy en adelante, sin datos de las personas
create or replace function public.ocupacion_de_viajes() returns table (viaje_id text, asiento integer)
language sql stable security definer set search_path = public as $$
  select b.viaje_id, b.asiento
  from public.boletos b
  join public.viajes v on v.id = b.viaje_id
  where b.estado <> 'cancelado' and v.salida >= now() - interval '1 day';
$$;

revoke all on function public.ocupacion_de_viajes() from public;
grant execute on function public.ocupacion_de_viajes() to authenticated;
