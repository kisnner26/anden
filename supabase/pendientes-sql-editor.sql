-- se puede correr varias veces: lo que ya existe se salta y lo que falta se crea

-- ===== 0006: cuentas con usuario y teléfono =====
alter table public.perfiles add column if not exists usuario text unique;
alter table public.perfiles add column if not exists apellido text;
alter table public.perfiles add column if not exists telefono text unique;

alter table public.perfiles drop constraint if exists usuario_con_formato;
alter table public.perfiles
  add constraint usuario_con_formato check (usuario is null or usuario ~ '^[a-z0-9][a-z0-9._]{2,19}$');

create or replace function public.crear_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, nombre, apellido, usuario, telefono)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'apellido', ''),
    nullif(lower(new.raw_user_meta_data ->> 'usuario'), ''),
    nullif(new.raw_user_meta_data ->> 'telefono', '')
  );
  return new;
end;
$$;

create or replace function public.correo_de_acceso(p_identificador text) returns text
language sql stable security definer set search_path = public, auth as $$
  select coalesce(
    (select u.email::text from public.perfiles p join auth.users u on u.id = p.id
      where p.usuario = lower(trim(p_identificador))
         or p.telefono = regexp_replace(p_identificador, '\D', '', 'g')
      limit 1),
    lower(regexp_replace(trim(p_identificador), '\s|-', '', 'g')) || '@cuentas.anden.app'
  );
$$;

create or replace function public.acceso_disponible(p_usuario text, p_telefono text) returns text
language sql stable security definer set search_path = public as $$
  select case
    when exists (select 1 from public.perfiles where usuario = lower(trim(p_usuario))) then 'usuario'
    when exists (select 1 from public.perfiles where telefono = p_telefono) then 'telefono'
    else 'libre'
  end;
$$;

grant execute on function public.correo_de_acceso(text) to anon, authenticated;
grant execute on function public.acceso_disponible(text, text) to anon, authenticated;

-- ===== 0007: cierres completos =====
alter table public.cierres add column if not exists contenido jsonb;

drop policy if exists "conductores corrigen su cierre" on public.cierres;
create policy "conductores corrigen su cierre" on public.cierres for update
  using (
    public.es_conductor()
    and chofer_id = (select chofer_id from public.perfiles where id = auth.uid())
  )
  with check (
    public.es_conductor()
    and chofer_id = (select chofer_id from public.perfiles where id = auth.uid())
  );

-- ===== 0008: transmisión, abordaje y solicitudes =====
create table if not exists public.transmisiones (
  viaje_id text primary key,
  chofer_id text not null references public.perfiles (chofer_id),
  lat double precision,
  lng double precision,
  velocidad_ms double precision,
  registrada_en timestamptz not null default now()
);

alter table public.transmisiones enable row level security;

drop policy if exists "quien tiene cuenta ve los buses en camino" on public.transmisiones;
create policy "quien tiene cuenta ve los buses en camino" on public.transmisiones
  for select using (auth.uid() is not null);
drop policy if exists "el conductor transmite su viaje" on public.transmisiones;
create policy "el conductor transmite su viaje" on public.transmisiones for all
  using (
    public.es_conductor()
    and chofer_id = (select chofer_id from public.perfiles where id = auth.uid())
  )
  with check (
    public.es_conductor()
    and chofer_id = (select chofer_id from public.perfiles where id = auth.uid())
  );

create table if not exists public.abordajes (
  boleto_id text primary key,
  marcado_por text references public.perfiles (chofer_id),
  marcado_en timestamptz not null default now()
);

alter table public.abordajes enable row level security;

drop policy if exists "conductores y dueños ven el abordaje" on public.abordajes;
create policy "conductores y dueños ven el abordaje" on public.abordajes for select
  using (
    public.es_conductor()
    or exists (
      select 1 from public.boletos b
      where b.boleto_id = abordajes.boleto_id and b.creado_por = auth.uid()
    )
  );
drop policy if exists "conductores marcan el abordaje" on public.abordajes;
create policy "conductores marcan el abordaje" on public.abordajes for all
  using (public.es_conductor()) with check (public.es_conductor());

drop policy if exists "retirar la solicitud en revision" on public.solicitudes_conductor;
create policy "retirar la solicitud en revision" on public.solicitudes_conductor
  for delete using (auth.uid() = usuario_id and estado = 'en_revision');

-- ===== 0009: un asiento, un boleto =====
update public.boletos b set estado = 'cancelado'
where estado <> 'cancelado' and exists (
  select 1 from public.boletos o
  where o.viaje_id = b.viaje_id and o.asiento = b.asiento and o.estado <> 'cancelado'
    and (o.actualizado_en, o.boleto_id) < (b.actualizado_en, b.boleto_id)
);

create unique index if not exists boletos_un_asiento_por_viaje
  on public.boletos (viaje_id, asiento)
  where estado <> 'cancelado';

-- ===== 0010: perfil público del chofer =====
-- lo que el pasajero ve de su chofer: nombre y foto, publicados por el propio conductor
create table if not exists public.perfiles_chofer (
  chofer_id text primary key,
  nombre text not null,
  foto_url text,
  actualizado_en timestamptz not null default now()
);

alter table public.perfiles_chofer enable row level security;

drop policy if exists "cualquiera ve al chofer" on public.perfiles_chofer;
create policy "cualquiera ve al chofer" on public.perfiles_chofer
  for select using (true);

drop policy if exists "el conductor publica su perfil" on public.perfiles_chofer;
create policy "el conductor publica su perfil" on public.perfiles_chofer
  for insert with check (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol = 'conductor' and p.chofer_id = perfiles_chofer.chofer_id
    )
  );

drop policy if exists "el conductor edita su perfil" on public.perfiles_chofer;
create policy "el conductor edita su perfil" on public.perfiles_chofer
  for update using (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol = 'conductor' and p.chofer_id = perfiles_chofer.chofer_id
    )
  ) with check (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol = 'conductor' and p.chofer_id = perfiles_chofer.chofer_id
    )
  );

-- fotos de los choferes: se leen sin sesión; cada conductor solo escribe en su carpeta
insert into storage.buckets (id, name, public) values ('fotos-choferes', 'fotos-choferes', true)
on conflict (id) do nothing;

drop policy if exists "fotos de choferes: escribir" on storage.objects;
create policy "fotos de choferes: escribir" on storage.objects
  for all using (
    bucket_id = 'fotos-choferes' and exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol = 'conductor' and p.chofer_id = (storage.foldername(name))[1]
    )
  ) with check (
    bucket_id = 'fotos-choferes' and exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol = 'conductor' and p.chofer_id = (storage.foldername(name))[1]
    )
  );

-- ===== 0011: asientos ocupados del servidor =====
-- qué asientos de un viaje ya están vendidos, sin mostrar de quién son: así todos los teléfonos ven lo mismo
create or replace function public.asientos_ocupados(p_viaje text) returns setof integer
language sql stable security definer set search_path = public as $$
  select asiento from public.boletos where viaje_id = p_viaje and estado <> 'cancelado';
$$;

revoke all on function public.asientos_ocupados(text) from public;
grant execute on function public.asientos_ocupados(text) to authenticated;

-- ===== 0012: viajes publicados por conductores =====
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

-- ===== 0013: hora real de salida =====
-- el interlocal no tiene hora fija: sale cuando se llena. `salida` es la hora en que se pone a esperar
-- pasajeros y `salio_en` la hora en que de verdad arrancó, que alimenta las estimaciones
alter table public.viajes add column if not exists salio_en timestamptz;

-- ===== 0014: aprobar conductor =====
-- aprueba a una persona como conductor con una sola línea desde el editor de SQL de Supabase:
--   select public.aprobar_conductor('ivan.obando');
-- le da el rol, le asigna el siguiente código de chofer (cho_1, cho_2...) y marca su solicitud como aprobada.
-- Solo la puede correr quien administra el proyecto: la app nunca puede darse el rol a sí misma.
create or replace function public.aprobar_conductor(p_usuario text) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
  v_chofer text;
begin
  select id, chofer_id into v_id, v_chofer from public.perfiles where usuario = lower(p_usuario);
  if v_id is null then
    raise exception 'No existe el usuario %', p_usuario;
  end if;
  if v_chofer is null then
    select 'cho_' || (coalesce(max(substring(chofer_id from 5)::int), 0) + 1) into v_chofer
    from public.perfiles where chofer_id ~ '^cho_[0-9]+$';
  end if;
  update public.perfiles set rol = 'conductor', chofer_id = v_chofer where id = v_id;
  update public.solicitudes_conductor set estado = 'aprobada' where usuario_id = v_id;
  return v_chofer;
end;
$$;

revoke all on function public.aprobar_conductor(text) from public, anon, authenticated;

-- ===== 0015: encomiendas con chofer =====
-- las encomiendas viajan en un bus concreto: el chofer de ese viaje las ve, las acepta o rechaza con un motivo
-- y marca cuándo las recibió y cuándo las entregó; quien las envía sigue el estado desde su teléfono
create table if not exists public.encomiendas (
  id text primary key,
  viaje_id text,
  chofer_id text,
  estado text not null default 'solicitada'
    check (estado in ('solicitada', 'aceptada', 'rechazada', 'recibida', 'entregada', 'cancelada')),
  motivo text,
  contenido jsonb not null,
  remitente_id uuid not null default auth.uid() references auth.users (id),
  creada_en timestamptz not null default now(),
  actualizada_en timestamptz not null default now()
);

create index if not exists encomiendas_chofer_idx on public.encomiendas (chofer_id);
create index if not exists encomiendas_remitente_idx on public.encomiendas (remitente_id);

alter table public.encomiendas enable row level security;

drop policy if exists "el remitente ve sus encomiendas" on public.encomiendas;
create policy "el remitente ve sus encomiendas" on public.encomiendas
  for select using (remitente_id = auth.uid());

drop policy if exists "el chofer ve las encomiendas de sus viajes" on public.encomiendas;
create policy "el chofer ve las encomiendas de sus viajes" on public.encomiendas
  for select using (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol = 'conductor' and p.chofer_id = encomiendas.chofer_id
    )
  );

drop policy if exists "cada quien envía sus encomiendas" on public.encomiendas;
create policy "cada quien envía sus encomiendas" on public.encomiendas
  for insert with check (remitente_id = auth.uid() and estado = 'solicitada');

drop policy if exists "el remitente cancela la suya" on public.encomiendas;
create policy "el remitente cancela la suya" on public.encomiendas
  for update using (remitente_id = auth.uid() and estado = 'solicitada')
  with check (remitente_id = auth.uid() and estado = 'cancelada');

drop policy if exists "el chofer actualiza el estado" on public.encomiendas;
create policy "el chofer actualiza el estado" on public.encomiendas
  for update using (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol = 'conductor' and p.chofer_id = encomiendas.chofer_id
    )
  ) with check (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol = 'conductor' and p.chofer_id = encomiendas.chofer_id
    )
  );

-- ===== 0016: alertas de seguridad =====
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

-- ===== 0017: cooperativa =====
-- la cooperativa: un tercer rol que ve todo lo que pasa entre pasajeros y conductores desde un panel web
-- se compara el rol como texto para poder crear el valor y usarlo en el mismo script
alter type public.rol add value if not exists 'cooperativa';

create or replace function public.es_cooperativa() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and rol::text = 'cooperativa');
$$;

-- lectura completa para la cooperativa
do $$
declare tabla text;
begin
  foreach tabla in array array['perfiles', 'viajes', 'boletos', 'pagos', 'cierres', 'transmisiones',
    'abordajes', 'encomiendas', 'alertas', 'solicitudes_conductor', 'perfiles_chofer']
  loop
    if to_regclass('public.' || tabla) is not null then
      execute format('drop policy if exists "cooperativa lee %1$s" on public.%1$I', tabla);
      execute format('create policy "cooperativa lee %1$s" on public.%1$I for select using (public.es_cooperativa())', tabla);
    end if;
  end loop;
end $$;

-- puede marcar una alerta como atendida y cancelar viajes
drop policy if exists "cooperativa atiende alertas" on public.alertas;
create policy "cooperativa atiende alertas" on public.alertas
  for update using (public.es_cooperativa()) with check (public.es_cooperativa());

drop policy if exists "cooperativa cancela viajes" on public.viajes;
create policy "cooperativa cancela viajes" on public.viajes
  for update using (public.es_cooperativa()) with check (public.es_cooperativa());

-- las fotos de la cédula las ve solo la cooperativa, además de quien las subió
drop policy if exists "cooperativa ve las cedulas" on storage.objects;
create policy "cooperativa ve las cedulas" on storage.objects
  for select using (bucket_id = 'cedulas' and public.es_cooperativa());

-- aprobar o rechazar una solicitud de conductor desde el panel
create or replace function public.resolver_solicitud(p_usuario_id uuid, p_aprobar boolean) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_chofer text;
begin
  if not public.es_cooperativa() then
    raise exception 'Solo la cooperativa puede resolver solicitudes';
  end if;
  if not p_aprobar then
    update public.solicitudes_conductor set estado = 'rechazada' where usuario_id = p_usuario_id;
    return null;
  end if;
  select chofer_id into v_chofer from public.perfiles where id = p_usuario_id;
  if v_chofer is null then
    select 'cho_' || (coalesce(max(substring(chofer_id from 5)::int), 0) + 1) into v_chofer
    from public.perfiles where chofer_id ~ '^cho_[0-9]+$';
  end if;
  update public.perfiles set rol = 'conductor', chofer_id = v_chofer where id = p_usuario_id;
  update public.solicitudes_conductor set estado = 'aprobada' where usuario_id = p_usuario_id;
  return v_chofer;
end;
$$;

revoke all on function public.resolver_solicitud(uuid, boolean) from public, anon;
grant execute on function public.resolver_solicitud(uuid, boolean) to authenticated;

-- convierte una cuenta en cooperativa: solo se corre desde el editor de SQL, nunca desde una app
--   select public.hacer_cooperativa('mi.usuario');
create or replace function public.hacer_cooperativa(p_usuario text) returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.perfiles set rol = 'cooperativa'::public.rol where usuario = lower(p_usuario);
  if not found then
    raise exception 'No existe el usuario %', p_usuario;
  end if;
end;
$$;

revoke all on function public.hacer_cooperativa(text) from public, anon, authenticated;

-- 0018: punto de encuentro como Plus Code en lugar del número de andén
alter table public.viajes add column if not exists punto_encuentro text;

-- los viajes nuevos ya no llevan número de andén; los viejos lo conservan pero la app no lo muestra
alter table public.viajes alter column anden drop not null;
alter table public.viajes drop constraint if exists viajes_anden_check;

-- un Plus Code completo: ocho signos, el signo +, y de dos a siete signos más
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'viajes_punto_encuentro_formato'
  ) then
    alter table public.viajes add constraint viajes_punto_encuentro_formato check (
      punto_encuentro is null
      or punto_encuentro ~ '^[23456789CFGHJMPQRVWX]{8}\+[23456789CFGHJMPQRVWX]{2,7}$'
    );
  end if;
end;
$$;

-- 0019: viaje compartido en tiempo real
create table public.compartidos (
  token text primary key,
  viaje_id text not null,
  nombre text not null,
  origen text not null,
  destino text not null,
  creado_por uuid not null default auth.uid() references auth.users (id),
  creado_en timestamptz not null default now(),
  expira_en timestamptz not null
);

create index compartidos_viaje_idx on public.compartidos (viaje_id);

alter table public.compartidos enable row level security;

create policy "cada quien ve sus enlaces" on public.compartidos for select
  using (creado_por = auth.uid());

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

-- 0020: datos para los modelos de predicción

alter table public.viajes add column if not exists llego_en timestamptz;

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
create policy "sin acceso directo" on public.ocupacion_historial for all using (false);

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
create policy "el conductor deja posiciones de su viaje" on public.telemetria_eventos
  for insert with check (
    public.es_conductor()
    and exists (
      select 1 from public.viajes v
      join public.perfiles p on p.chofer_id = v.chofer_id
      where v.id = telemetria_eventos.viaje_id and p.id = auth.uid()
    )
  );

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


-- 0021: transferir boletos

create table public.transferencias (
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

create index transferencias_boleto_idx on public.transferencias (boleto_id);

alter table public.transferencias enable row level security;

create policy "cada quien ve las que ofreció" on public.transferencias for select
  using (de = auth.uid());

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

-- 0022: estado para pasajeros
-- que cada pasajero vea en su boleto lo que el conductor va marcando: si ya subió y si ya pagó
-- (la tabla `abordajes` ya la deja leer a su dueño desde 0008; `pagos` solo la leían los conductores)
drop policy if exists "el dueño ve el pago de su boleto" on public.pagos;
create policy "el dueño ve el pago de su boleto" on public.pagos for select
  using (
    exists (
      select 1 from public.boletos b
      where b.boleto_id = pagos.boleto_id and b.creado_por = auth.uid()
    )
  );

-- avisos en tiempo real cuando el conductor cambia algo (la app además pregunta cada pocos segundos)
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.viajes;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.abordajes;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.pagos;
    exception when duplicate_object then null;
    end;
  end if;
end;
$$;

-- 0023: fotos de pasajeros
-- la foto de cada pasajero, para que el conductor sepa a quién espera al verlo en la lista de a bordo
insert into storage.buckets (id, name, public) values ('fotos-pasajeros', 'fotos-pasajeros', true)
on conflict (id) do nothing;

-- cada persona sube y reemplaza solo lo que está en su carpeta (su identificador); la lectura es pública
drop policy if exists "fotos de pasajeros: escribir" on storage.objects;
create policy "fotos de pasajeros: escribir" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'fotos-pasajeros' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "fotos de pasajeros: reemplazar" on storage.objects;
create policy "fotos de pasajeros: reemplazar" on storage.objects
  for update to authenticated using (
    bucket_id = 'fotos-pasajeros' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "fotos de pasajeros: leer" on storage.objects;
create policy "fotos de pasajeros: leer" on storage.objects
  for select using (bucket_id = 'fotos-pasajeros');

-- 0024_endurecer_seguridad.sql
-- endurece los permisos: cada conductor ve y toca solo lo de sus propios viajes, un enlace compartido solo lo
-- crea quien viaja o conduce ese viaje, y las fotos de pasajeros ya no se pueden listar sin cuenta

-- ¿el viaje es de la persona que tiene la sesión abierta? (security definer para no depender de las políticas de perfiles)
create or replace function public.es_chofer_del_viaje(p_viaje text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.viajes v
    join public.perfiles p on p.chofer_id = v.chofer_id
    where v.id = p_viaje and p.id = auth.uid() and p.rol = 'conductor'
  );
$$;
revoke all on function public.es_chofer_del_viaje(text) from public, anon;
grant execute on function public.es_chofer_del_viaje(text) to authenticated;

-- boletos: un conductor ve y marca solo los boletos de sus viajes (antes veía todos los de todas las personas)
drop policy if exists "conductores ven los boletos" on public.boletos;
create policy "conductores ven los boletos de sus viajes" on public.boletos for select
  using (public.es_chofer_del_viaje(viaje_id));
drop policy if exists "conductores marcan el uso" on public.boletos;
create policy "conductores marcan el uso de sus viajes" on public.boletos for update
  using (public.es_chofer_del_viaje(viaje_id)) with check (public.es_chofer_del_viaje(viaje_id));

-- desde la app nadie cambia a qué viaje, asiento o cuenta pertenece un boleto; la transferencia corre con el rol del
-- dueño de la base y sí puede pasarlo a otra cuenta
create or replace function public.boleto_no_se_muda() returns trigger
language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') and (
    new.viaje_id is distinct from old.viaje_id
    or new.asiento is distinct from old.asiento
    or new.creado_por is distinct from old.creado_por
    or new.boleto_id is distinct from old.boleto_id
  ) then
    raise exception 'un boleto no cambia de viaje, asiento ni dueño desde la app';
  end if;
  return new;
end;
$$;
drop trigger if exists boleto_no_se_muda on public.boletos;
create trigger boleto_no_se_muda before update on public.boletos
  for each row execute function public.boleto_no_se_muda();

-- pagos y abordajes: solo el conductor del viaje al que pertenece el boleto
drop policy if exists "conductores leen pagos" on public.pagos;
create policy "conductores leen pagos de sus viajes" on public.pagos for select using (
  exists (select 1 from public.boletos b where b.boleto_id = pagos.boleto_id and public.es_chofer_del_viaje(b.viaje_id))
);
drop policy if exists "conductores marcan pagos" on public.pagos;
create policy "conductores marcan pagos de sus viajes" on public.pagos for all
  using (exists (select 1 from public.boletos b where b.boleto_id = pagos.boleto_id and public.es_chofer_del_viaje(b.viaje_id)))
  with check (exists (select 1 from public.boletos b where b.boleto_id = pagos.boleto_id and public.es_chofer_del_viaje(b.viaje_id)));

drop policy if exists "conductores y dueños ven el abordaje" on public.abordajes;
create policy "conductores y dueños ven el abordaje" on public.abordajes for select using (
  exists (
    select 1 from public.boletos b
    where b.boleto_id = abordajes.boleto_id
      and (b.creado_por = auth.uid() or public.es_chofer_del_viaje(b.viaje_id))
  )
);
drop policy if exists "conductores marcan el abordaje" on public.abordajes;
create policy "conductores marcan el abordaje de sus viajes" on public.abordajes for all
  using (exists (select 1 from public.boletos b where b.boleto_id = abordajes.boleto_id and public.es_chofer_del_viaje(b.viaje_id)))
  with check (exists (select 1 from public.boletos b where b.boleto_id = abordajes.boleto_id and public.es_chofer_del_viaje(b.viaje_id)));

-- transmisión en vivo: solo del viaje que uno conduce (antes podía abrir la de un viaje ajeno que aún no tuviera fila)
drop policy if exists "el conductor transmite su viaje" on public.transmisiones;
create policy "el conductor transmite su viaje" on public.transmisiones for all
  using (
    public.es_conductor()
    and chofer_id = (select chofer_id from public.perfiles where id = auth.uid())
  )
  with check (
    public.es_conductor()
    and chofer_id = (select chofer_id from public.perfiles where id = auth.uid())
    and public.es_chofer_del_viaje(viaje_id)
  );

-- enlace para seguir un viaje: solo lo crea quien tiene boleto en ese viaje o lo conduce
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
  if not (
    exists (
      select 1 from public.boletos
      where viaje_id = p_viaje_id and creado_por = auth.uid() and estado <> 'cancelado'
    )
    or public.es_chofer_del_viaje(p_viaje_id)
  ) then
    raise exception 'solo quien viaja o conduce puede compartir este viaje';
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

-- fotos de pasajeros: la lectura por enlace sigue abierta (el bucket es público) pero ya no se pueden listar todas
drop policy if exists "fotos de pasajeros: leer" on storage.objects;
create policy "fotos de pasajeros: leer las propias" on storage.objects
  for select to authenticated using (
    bucket_id = 'fotos-pasajeros' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- las funciones de cuenta no se llaman sin sesión
revoke all on function public.crear_transferencia(text) from public, anon;
revoke all on function public.estado_transferencia(text) from public, anon;
revoke all on function public.reclamar_transferencia(text) from public, anon;
revoke all on function public.cancelar_transferencia(text) from public, anon;
revoke all on function public.crear_compartido(text, text, text, text, integer) from public, anon;
grant execute on function public.crear_compartido(text, text, text, text, integer) to authenticated;

-- 0025_motivo_de_cancelacion.sql
-- el motivo con que un conductor cancela un viaje con pasajeros: lo ven quienes tenían boleto
alter table public.viajes add column if not exists motivo_cancelacion text
  check (motivo_cancelacion is null or motivo_cancelacion in ('averia', 'clima', 'pocos', 'otro'));

-- 0026_conversacion_chofer_pasajero.sql
-- el chofer y sus pasajeros se hablan sin compartir sus datos: un viaje puede buscar pasajeros, el chofer avisa a quienes
-- tienen boleto y cada uno puede llamar al otro solo mientras el viaje está en curso

-- "Buscar pasajeros": hasta cuándo lo pide el chofer y una frase corta; lo ven todos junto al viaje
alter table public.viajes add column if not exists busca_hasta timestamptz;
alter table public.viajes add column if not exists busca_mensaje text
  check (busca_mensaje is null or char_length(busca_mensaje) <= 80);

-- avisos del chofer a quienes tienen boleto en su viaje
create table if not exists public.avisos_viaje (
  id uuid primary key default gen_random_uuid(),
  viaje_id text not null,
  texto text not null check (char_length(texto) between 1 and 120),
  creado_en timestamptz not null default now()
);
create index if not exists avisos_viaje_idx on public.avisos_viaje (viaje_id, creado_en desc);
alter table public.avisos_viaje enable row level security;

drop policy if exists "el chofer avisa a su viaje" on public.avisos_viaje;
create policy "el chofer avisa a su viaje" on public.avisos_viaje for insert
  with check (public.es_chofer_del_viaje(viaje_id));
drop policy if exists "chofer y pasajeros ven los avisos" on public.avisos_viaje;
create policy "chofer y pasajeros ven los avisos" on public.avisos_viaje for select using (
  public.es_chofer_del_viaje(viaje_id)
  or exists (
    select 1 from public.boletos b
    where b.viaje_id = avisos_viaje.viaje_id and b.creado_por = auth.uid() and b.estado <> 'cancelado'
  )
);
drop policy if exists "cooperativa lee avisos_viaje" on public.avisos_viaje;
create policy "cooperativa lee avisos_viaje" on public.avisos_viaje for select using (public.es_cooperativa());

-- el teléfono del chofer, solo para quien tiene boleto vigente en ese viaje y desde 2 horas antes de la salida hasta 12 después
create or replace function public.telefono_del_chofer(p_viaje text) returns text
language sql stable security definer set search_path = public as $$
  select p.telefono
  from public.viajes v
  join public.perfiles p on p.chofer_id = v.chofer_id
  where v.id = p_viaje
    and p.telefono is not null
    and now() between v.salida - interval '2 hours' and v.salida + interval '12 hours'
    and exists (
      select 1 from public.boletos b
      where b.viaje_id = p_viaje and b.creado_por = auth.uid() and b.estado = 'vigente'
    );
$$;

-- el teléfono de quien reservó un boleto, solo para el chofer de ese viaje y en la misma ventana de tiempo
create or replace function public.telefono_del_pasajero(p_boleto text) returns text
language sql stable security definer set search_path = public as $$
  select p.telefono
  from public.boletos b
  join public.viajes v on v.id = b.viaje_id
  join public.perfiles p on p.id = b.creado_por
  where b.boleto_id = p_boleto
    and b.estado = 'vigente'
    and p.telefono is not null
    and public.es_chofer_del_viaje(b.viaje_id)
    and now() between v.salida - interval '2 hours' and v.salida + interval '12 hours';
$$;

revoke all on function public.telefono_del_chofer(text) from public, anon;
revoke all on function public.telefono_del_pasajero(text) from public, anon;
grant execute on function public.telefono_del_chofer(text) to authenticated;
grant execute on function public.telefono_del_pasajero(text) to authenticated;

-- 0027_objetos_perdidos.sql
-- objetos olvidados en el bus: el chofer los fotografía y quien viajó los reconoce y los reclama desde la app

insert into storage.buckets (id, name, public) values ('objetos-perdidos', 'objetos-perdidos', true)
on conflict (id) do nothing;

-- cada chofer sube solo a su carpeta; la foto se ve con su enlace, pero no se puede listar el bucket
drop policy if exists "objetos perdidos: subir" on storage.objects;
create policy "objetos perdidos: subir" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'objetos-perdidos' and (storage.foldername(name))[1] = auth.uid()::text
  );

create table if not exists public.objetos_perdidos (
  id uuid primary key default gen_random_uuid(),
  viaje_id text not null,
  descripcion text not null check (char_length(descripcion) between 1 and 120),
  foto_url text,
  reportado_por uuid not null default auth.uid() references auth.users (id),
  creado_en timestamptz not null default now(),
  reclamado_por uuid references auth.users (id),
  reclamado_en timestamptz
);
create index if not exists objetos_perdidos_viaje_idx on public.objetos_perdidos (viaje_id, creado_en desc);
alter table public.objetos_perdidos enable row level security;

drop policy if exists "el chofer reporta un objeto de su viaje" on public.objetos_perdidos;
create policy "el chofer reporta un objeto de su viaje" on public.objetos_perdidos for insert
  with check (reportado_por = auth.uid() and public.es_chofer_del_viaje(viaje_id));

drop policy if exists "chofer y pasajeros ven los objetos del viaje" on public.objetos_perdidos;
create policy "chofer y pasajeros ven los objetos del viaje" on public.objetos_perdidos for select using (
  public.es_chofer_del_viaje(viaje_id)
  or exists (
    select 1 from public.boletos b
    where b.viaje_id = objetos_perdidos.viaje_id and b.creado_por = auth.uid() and b.estado <> 'cancelado'
  )
);

drop policy if exists "cooperativa lee objetos_perdidos" on public.objetos_perdidos;
create policy "cooperativa lee objetos_perdidos" on public.objetos_perdidos for select using (public.es_cooperativa());

-- quien tuvo boleto en ese viaje dice "es mío"; el primero que lo reclama se lo queda y el chofer lo ve
create or replace function public.reclamar_objeto(p_id uuid) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_filas integer;
begin
  update public.objetos_perdidos o
  set reclamado_por = auth.uid(), reclamado_en = now()
  where o.id = p_id
    and o.reclamado_por is null
    and exists (
      select 1 from public.boletos b
      where b.viaje_id = o.viaje_id and b.creado_por = auth.uid() and b.estado <> 'cancelado'
    );
  get diagnostics v_filas = row_count;
  return v_filas > 0;
end;
$$;
revoke all on function public.reclamar_objeto(uuid) from public, anon;
grant execute on function public.reclamar_objeto(uuid) to authenticated;
