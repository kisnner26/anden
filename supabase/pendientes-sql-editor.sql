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
