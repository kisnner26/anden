-- enlaces para que un familiar siga un viaje sin tener la app: cada enlace es un código largo que solo
-- conoce quien lo recibe, vence solo y muestra únicamente lo mínimo (ruta, bus, hora y por dónde va)
create table if not exists public.compartidos (
  token text primary key,
  viaje_id text not null,
  nombre text not null,
  origen text not null,
  destino text not null,
  creado_por uuid not null default auth.uid() references auth.users (id),
  creado_en timestamptz not null default now(),
  expira_en timestamptz not null
);

create index if not exists compartidos_viaje_idx on public.compartidos (viaje_id);

alter table public.compartidos enable row level security;

-- quien lo creó puede verlo; nadie más lee la tabla, el enlace público pasa solo por la función de abajo
drop policy if exists "cada quien ve sus enlaces" on public.compartidos;
create policy "cada quien ve sus enlaces" on public.compartidos for select
  using (creado_por = auth.uid());

-- crea el enlace con un código generado en el servidor, que no se puede adivinar
create or replace function public.crear_compartido(
  p_viaje_id text,
  p_nombre text,
  p_origen text,
  p_destino text,
  p_horas integer default 12
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text := replace(gen_random_uuid()::text, '-', '');
begin
  if auth.uid() is null then
    raise exception 'hace falta una cuenta';
  end if;
  insert into public.compartidos (token, viaje_id, nombre, origen, destino, creado_por, expira_en)
  values (
    v_token,
    p_viaje_id,
    left(trim(p_nombre), 40),
    left(trim(p_origen), 60),
    left(trim(p_destino), 60),
    auth.uid(),
    now() + make_interval(hours => least(greatest(p_horas, 1), 48))
  );
  return v_token;
end;
$$;

grant execute on function public.crear_compartido(text, text, text, text, integer) to authenticated;

-- lo que ve quien abre el enlace: sin teléfono, sin cédula, sin código de boleto, solo el viaje
create or replace function public.ver_viaje_compartido(p_token text) returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'nombre', c.nombre,
    'origen', c.origen,
    'destino', c.destino,
    'salida', v.salida,
    'placa', v.placa,
    'servicio', v.servicio,
    'estado', v.estado,
    'salio_en', v.salio_en,
    'lat', t.lat,
    'lng', t.lng,
    'velocidad_ms', t.velocidad_ms,
    'registrada_en', t.registrada_en,
    'expira_en', c.expira_en
  )
  from public.compartidos c
  join public.viajes v on v.id = c.viaje_id
  left join public.transmisiones t on t.viaje_id = c.viaje_id
  where c.token = p_token and c.expira_en > now();
$$;

grant execute on function public.ver_viaje_compartido(text) to anon, authenticated;
-- datos para los modelos de predicción de la tesis: ocupación en el tiempo, trayectorias y llegada real
-- todo seudónimo: ninguna de estas tablas guarda nombre, teléfono, cédula ni código de boleto

-- la hora real de llegada, para aprender cuánto tarda cada trayecto
alter table public.viajes add column if not exists llego_en timestamptz;

-- cuántos asientos llevaba vendidos cada salida a 24, 12, 6, 3, 1 y 0 horas de partir
create table if not exists public.ocupacion_historial (
  viaje_id text not null,
  horas_antes smallint not null check (horas_antes in (0, 1, 3, 6, 12, 24)),
  servicio text not null,
  asientos_vendidos integer not null check (asientos_vendidos >= 0),
  capturado_en timestamptz not null default now(),
  primary key (viaje_id, horas_antes)
);

create index if not exists ocupacion_historial_captura_idx on public.ocupacion_historial (capturado_en);

alter table public.ocupacion_historial enable row level security;
-- solo lo lee y escribe el servicio de la API (clave de servicio); la app no toca esta tabla
drop policy if exists "sin acceso directo" on public.ocupacion_historial;
create policy "sin acceso directo" on public.ocupacion_historial for all using (false);

-- trayectoria de cada viaje: una fila por posición recibida, sin identificar a la persona
create table if not exists public.telemetria_eventos (
  id bigint generated always as identity primary key,
  viaje_id text not null,
  registrada_en timestamptz not null,
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  velocidad_ms double precision check (velocidad_ms is null or velocidad_ms >= 0),
  precision_m double precision check (precision_m is null or precision_m >= 0)
);

create index if not exists telemetria_eventos_viaje_idx on public.telemetria_eventos (viaje_id, registrada_en);

alter table public.telemetria_eventos enable row level security;
-- el conductor de un viaje puede dejar posiciones de ese viaje; nadie las lee desde la app
drop policy if exists "el conductor deja posiciones de su viaje" on public.telemetria_eventos;
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
-- pasar un boleto vigente a otra persona: quien lo tiene genera un código corto, la otra persona lo canjea
-- (por AirDrop, Quick Share, mensaje o dictándolo en persona) y el boleto pasa a su cuenta con su nombre

create table if not exists public.transferencias (
  codigo text primary key,
  boleto_id text not null references public.boletos (boleto_id) on delete cascade,
  de uuid not null default auth.uid() references auth.users (id),
  para uuid references auth.users (id),
  para_nombre text,
  creada_en timestamptz not null default now(),
  expira_en timestamptz not null,
  reclamada_en timestamptz,
  cancelada_en timestamptz
);

create index if not exists transferencias_boleto_idx on public.transferencias (boleto_id);

alter table public.transferencias enable row level security;

-- quien ofrece el boleto ve sus transferencias; nadie las crea ni las cambia a mano, solo las funciones de abajo
drop policy if exists "cada quien ve las que ofreció" on public.transferencias;
create policy "cada quien ve las que ofreció" on public.transferencias for select
  using (de = auth.uid());

-- 8 signos sin letras que se confunden (sin 0, O, 1, I, L), generados con aleatoriedad del servidor
create or replace function public.codigo_de_transferencia() returns text
language plpgsql
volatile
as $$
declare
  v_alfabeto constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_hex text := replace(gen_random_uuid()::text, '-', '');
  v_codigo text := '';
  v_i integer;
begin
  for v_i in 0..7 loop
    v_codigo := v_codigo || substr(
      v_alfabeto,
      1 + (('x' || substr(v_hex, v_i * 2 + 1, 2))::bit(8)::integer % length(v_alfabeto)),
      1
    );
  end loop;
  return v_codigo;
end;
$$;

-- ofrece un boleto vigente propio; vale 30 minutos y reemplaza cualquier oferta anterior del mismo boleto
create or replace function public.crear_transferencia(p_boleto_id text) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_codigo text;
begin
  if auth.uid() is null then
    raise exception 'hace falta una cuenta';
  end if;
  if not exists (
    select 1 from public.boletos
    where boleto_id = p_boleto_id and creado_por = auth.uid() and estado = 'vigente'
  ) then
    raise exception 'el boleto no es tuyo o ya no está vigente';
  end if;

  update public.transferencias set cancelada_en = now()
  where boleto_id = p_boleto_id and reclamada_en is null and cancelada_en is null;

  v_codigo := public.codigo_de_transferencia();
  insert into public.transferencias (codigo, boleto_id, de, expira_en)
  values (v_codigo, p_boleto_id, auth.uid(), now() + interval '30 minutes');
  return v_codigo;
end;
$$;

-- lo que ve quien ofreció el boleto: si sigue esperando, si ya lo recibieron (y quién) o si venció
create or replace function public.estado_transferencia(p_codigo text) returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select jsonb_build_object(
        'estado',
          case
            when t.reclamada_en is not null then 'reclamada'
            when t.cancelada_en is not null then 'cancelada'
            when t.expira_en <= now() then 'vencida'
            else 'pendiente'
          end,
        'para_nombre', split_part(coalesce(t.para_nombre, ''), ' ', 1),
        'expira_en', t.expira_en
      )
      from public.transferencias t
      where t.codigo = p_codigo and t.de = auth.uid()
    ),
    jsonb_build_object('estado', 'inexistente')
  );
$$;

-- canjea el código: el boleto pasa a la cuenta de quien lo canjea, con su nombre, y devuelve el boleto para guardarlo
create or replace function public.reclamar_transferencia(p_codigo text) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_t public.transferencias;
  v_nombre text;
  v_contenido jsonb;
begin
  if auth.uid() is null then
    raise exception 'hace falta una cuenta';
  end if;
  select * into v_t from public.transferencias where codigo = upper(trim(p_codigo)) for update;
  if not found then
    return jsonb_build_object('error', 'no-existe');
  end if;
  if v_t.reclamada_en is not null or v_t.cancelada_en is not null then
    return jsonb_build_object('error', 'ya-usada');
  end if;
  if v_t.expira_en <= now() then
    return jsonb_build_object('error', 'vencida');
  end if;
  if v_t.de = auth.uid() then
    return jsonb_build_object('error', 'propia');
  end if;

  select nombre into v_nombre from public.perfiles where id = auth.uid();
  update public.boletos
  set creado_por = auth.uid(),
      contenido = jsonb_set(contenido, '{boleto,pasajero,nombre}', to_jsonb(coalesce(v_nombre, 'Pasajero'))),
      actualizado_en = now()
  where boleto_id = v_t.boleto_id and estado = 'vigente'
  returning contenido into v_contenido;
  if v_contenido is null then
    return jsonb_build_object('error', 'ya-usada');
  end if;

  update public.transferencias
  set para = auth.uid(), para_nombre = v_nombre, reclamada_en = now()
  where codigo = v_t.codigo;
  return jsonb_build_object('boleto', v_contenido);
end;
$$;

create or replace function public.cancelar_transferencia(p_codigo text) returns void
language sql
security definer
set search_path = public
as $$
  update public.transferencias set cancelada_en = now()
  where codigo = p_codigo and de = auth.uid() and reclamada_en is null and cancelada_en is null;
$$;

revoke execute on function public.codigo_de_transferencia() from public, anon, authenticated;
grant execute on function public.crear_transferencia(text) to authenticated;
grant execute on function public.estado_transferencia(text) to authenticated;
grant execute on function public.reclamar_transferencia(text) to authenticated;
grant execute on function public.cancelar_transferencia(text) to authenticated;
