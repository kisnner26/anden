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
