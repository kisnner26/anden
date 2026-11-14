-- datos para los modelos de predicción de la tesis: ocupación en el tiempo, trayectorias y llegada real
-- todo seudónimo: ninguna de estas tablas guarda nombre, teléfono, cédula ni código de boleto

-- la hora real de llegada, para aprender cuánto tarda cada trayecto
alter table public.viajes add column if not exists llego_en timestamptz;

-- cuántos asientos llevaba vendidos cada salida a 24, 12, 6, 3, 1 y 0 horas de partir
create table public.ocupacion_historial (
  viaje_id text not null,
  horas_antes smallint not null check (horas_antes in (0, 1, 3, 6, 12, 24)),
  servicio text not null,
  asientos_vendidos integer not null check (asientos_vendidos >= 0),
  capturado_en timestamptz not null default now(),
  primary key (viaje_id, horas_antes)
);

create index ocupacion_historial_captura_idx on public.ocupacion_historial (capturado_en);

alter table public.ocupacion_historial enable row level security;
-- solo lo lee y escribe el servicio de la API (clave de servicio); la app no toca esta tabla
create policy "sin acceso directo" on public.ocupacion_historial for all using (false);

-- trayectoria de cada viaje: una fila por posición recibida, sin identificar a la persona
create table public.telemetria_eventos (
  id bigint generated always as identity primary key,
  viaje_id text not null,
  registrada_en timestamptz not null,
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  velocidad_ms double precision check (velocidad_ms is null or velocidad_ms >= 0),
  precision_m double precision check (precision_m is null or precision_m >= 0)
);

create index telemetria_eventos_viaje_idx on public.telemetria_eventos (viaje_id, registrada_en);

alter table public.telemetria_eventos enable row level security;
-- el conductor de un viaje puede dejar posiciones de ese viaje; nadie las lee desde la app
create policy "el conductor deja posiciones de su viaje" on public.telemetria_eventos
  for insert with check (
    public.es_conductor()
    and exists (
      select 1 from public.viajes v
      join public.perfiles p on p.chofer_id = v.chofer_id
      where v.id = telemetria_eventos.viaje_id and p.id = auth.uid()
    )
  );

-- toma la foto de ocupación de las salidas que están a 24, 12, 6, 3, 1 o 0 horas de partir; se corre cada
-- 15 minutos (pg_cron) y no repite una foto que ya existe
create or replace function public.capturar_ocupacion() returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_insertadas integer := 0;
begin
  with ventanas as (
    select unnest(array[0, 1, 3, 6, 12, 24]) as horas
  ),
  candidatas as (
    select v.id as viaje_id, v.servicio, w.horas
    from public.viajes v
    cross join ventanas w
    where v.estado <> 'cancelado'
      and now() >= v.salida - make_interval(hours => w.horas)
      and now() < v.salida - make_interval(hours => w.horas) + interval '15 minutes'
  ),
  nuevas as (
    insert into public.ocupacion_historial (viaje_id, horas_antes, servicio, asientos_vendidos)
    select
      c.viaje_id,
      c.horas,
      c.servicio,
      (
        select count(*) from public.boletos b
        where b.viaje_id = c.viaje_id and b.estado in ('vigente', 'usado')
      )
    from candidatas c
    on conflict (viaje_id, horas_antes) do nothing
    returning 1
  )
  select count(*) into v_insertadas from nuevas;
  return v_insertadas;
end;
$$;

revoke execute on function public.capturar_ocupacion() from public, anon, authenticated;

-- para programarla (una sola vez, con pg_cron habilitado en Supabase):
--   select cron.schedule('capturar-ocupacion', '*/15 * * * *', 'select public.capturar_ocupacion()');
