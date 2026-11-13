-- Andén: todo el esquema de Supabase en un solo archivo, para pegar en SQL Editor y tocar Run.
-- Es la suma de supabase/migrations/0001 a 0004, en orden. Correlo una sola vez en un proyecto vacío.

-- ===== 0001_perfiles_y_roles.sql =====
-- perfiles: el rol vive aquí y solo lo cambia el servidor; la app nunca lo elige
create type public.rol as enum ('pasajero', 'conductor');

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  rol public.rol not null default 'pasajero',
  chofer_id text unique,
  creado_en timestamptz not null default now(),
  constraint conductor_con_chofer check (rol <> 'conductor' or chofer_id is not null)
);

alter table public.perfiles enable row level security;

create policy "cada quien lee su perfil" on public.perfiles
  for select using (auth.uid() = id);

create policy "cada quien edita su nombre" on public.perfiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    and rol = (select p.rol from public.perfiles p where p.id = auth.uid())
    and chofer_id is not distinct from (select p.chofer_id from public.perfiles p where p.id = auth.uid())
  );

-- toda cuenta nueva nace pasajera; un conductor lo asigna el operador desde el panel
create function public.crear_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger al_crear_usuario after insert on auth.users
  for each row execute function public.crear_perfil();

-- ===== 0002_pagos_y_cierres.sql =====
-- pagos en efectivo marcados por el conductor y cierre de cada viaje
create table public.pagos (
  boleto_id text primary key,
  estado text not null check (estado in ('pendiente', 'pagado_efectivo')),
  marcado_por text references public.perfiles (chofer_id),
  marcado_en timestamptz
);

create table public.cierres (
  viaje_id text primary key,
  chofer_id text not null references public.perfiles (chofer_id),
  cobrado integer not null check (cobrado >= 0),
  cerrado_en timestamptz not null default now()
);

alter table public.pagos enable row level security;
alter table public.cierres enable row level security;

create function public.es_conductor() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and rol = 'conductor');
$$;

create policy "conductores leen pagos" on public.pagos for select using (public.es_conductor());
create policy "conductores marcan pagos" on public.pagos for all
  using (public.es_conductor()) with check (public.es_conductor());
create policy "conductores leen cierres" on public.cierres for select using (public.es_conductor());
create policy "conductores cierran su viaje" on public.cierres for insert
  with check (
    public.es_conductor()
    and chofer_id = (select chofer_id from public.perfiles where id = auth.uid())
  );

-- ===== 0003_suscripciones.sql =====
-- Andén Plus: la suscripción mensual de 5 dólares; la confirma el servidor, nunca la app
create table public.suscripciones (
  usuario_id uuid primary key references public.perfiles (id) on delete cascade,
  plan text not null default 'gratis' check (plan in ('gratis', 'plus')),
  desde timestamptz,
  vence_en timestamptz,
  constraint plus_con_fecha check (plan = 'gratis' or desde is not null)
);

alter table public.suscripciones enable row level security;

-- cada quien lee su estado; escribir solo desde el servidor (llave de servicio o webhook de la tienda)
create policy "cada quien lee su suscripcion" on public.suscripciones
  for select using (auth.uid() = usuario_id);

-- ===== 0004_solicitudes_de_conductor.sql =====
-- solicitudes para ser conductor: cédula y fotos de sus dos lados; las revisa la cooperativa, no la app
create type public.estado_solicitud as enum ('en_revision', 'aprobada', 'rechazada');

create table public.solicitudes_conductor (
  usuario_id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  apellido text not null,
  telefono text not null,
  cedula text not null check (cedula ~ '^[0-9]{3}-[0-9]{6}-[0-9]{4}[A-Z]$'),
  foto_frente text not null,
  foto_dorso text not null,
  biometria_confirmada boolean not null default false check (biometria_confirmada),
  estado public.estado_solicitud not null default 'en_revision',
  creada_en timestamptz not null default now(),
  revisada_en timestamptz,
  unique (cedula)
);

alter table public.solicitudes_conductor enable row level security;

create policy "cada quien ve su solicitud" on public.solicitudes_conductor
  for select using (auth.uid() = usuario_id);

-- solo se puede crear en revisión; aprobar o rechazar lo hace el servidor con la llave de servicio
create policy "cada quien envia su solicitud" on public.solicitudes_conductor
  for insert with check (auth.uid() = usuario_id and estado = 'en_revision');

-- fotos de la cédula en un bucket privado: cada persona solo lee y escribe su propia carpeta
insert into storage.buckets (id, name, public) values ('cedulas', 'cedulas', false)
on conflict (id) do nothing;

create policy "fotos de cedula propias: escribir" on storage.objects
  for insert with check (
    bucket_id = 'cedulas' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "fotos de cedula propias: leer" on storage.objects
  for select using (
    bucket_id = 'cedulas' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ===== después de crear los usuarios en Authentication > Users =====
-- Los pasajeros no necesitan nada más: su perfil se crea solo. Para que una cuenta sea de conductor,
-- cambiá el correo y los datos y corré (ejemplo con el chofer de muestra Marvin Lanzas):
--
-- 0006
-- cuentas con usuario y teléfono: se entra con usuario, teléfono o código, nunca con correo
alter table public.perfiles
  add column usuario text unique,
  add column apellido text,
  add column telefono text unique;

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

-- el correo que usa Supabase por dentro para un usuario, un teléfono o un código; la app nunca lo muestra
create function public.correo_de_acceso(p_identificador text) returns text
language sql stable security definer set search_path = public, auth as $$
  select coalesce(
    (select u.email::text from public.perfiles p join auth.users u on u.id = p.id
      where p.usuario = lower(trim(p_identificador))
         or p.telefono = regexp_replace(p_identificador, '\D', '', 'g')
      limit 1),
    lower(regexp_replace(trim(p_identificador), '\s|-', '', 'g')) || '@cuentas.anden.app'
  );
$$;

-- antes de crear la cuenta: si el usuario o el teléfono ya existen
create function public.acceso_disponible(p_usuario text, p_telefono text) returns text
language sql stable security definer set search_path = public as $$
  select case
    when exists (select 1 from public.perfiles where usuario = lower(trim(p_usuario))) then 'usuario'
    when exists (select 1 from public.perfiles where telefono = p_telefono) then 'telefono'
    else 'libre'
  end;
$$;

grant execute on function public.correo_de_acceso(text) to anon, authenticated;
grant execute on function public.acceso_disponible(text, text) to anon, authenticated;

-- 0007
-- el cierre guarda el resumen completo (quién pagó y quién no) y se puede rehacer
alter table public.cierres add column contenido jsonb;

create policy "conductores corrigen su cierre" on public.cierres for update
  using (
    public.es_conductor()
    and chofer_id = (select chofer_id from public.perfiles where id = auth.uid())
  )
  with check (
    public.es_conductor()
    and chofer_id = (select chofer_id from public.perfiles where id = auth.uid())
  );

-- 0008
-- ubicación del bus en vivo: una fila por viaje mientras el conductor transmite
create table public.transmisiones (
  viaje_id text primary key,
  chofer_id text not null references public.perfiles (chofer_id),
  lat double precision,
  lng double precision,
  velocidad_ms double precision,
  registrada_en timestamptz not null default now()
);

alter table public.transmisiones enable row level security;

create policy "quien tiene cuenta ve los buses en camino" on public.transmisiones
  for select using (auth.uid() is not null);
create policy "el conductor transmite su viaje" on public.transmisiones for all
  using (
    public.es_conductor()
    and chofer_id = (select chofer_id from public.perfiles where id = auth.uid())
  )
  with check (
    public.es_conductor()
    and chofer_id = (select chofer_id from public.perfiles where id = auth.uid())
  );

-- quién ya subió al bus
create table public.abordajes (
  boleto_id text primary key,
  marcado_por text references public.perfiles (chofer_id),
  marcado_en timestamptz not null default now()
);

alter table public.abordajes enable row level security;

create policy "conductores y dueños ven el abordaje" on public.abordajes for select
  using (
    public.es_conductor()
    or exists (
      select 1 from public.boletos b
      where b.boleto_id = abordajes.boleto_id and b.creado_por = auth.uid()
    )
  );
create policy "conductores marcan el abordaje" on public.abordajes for all
  using (public.es_conductor()) with check (public.es_conductor());

-- quien envió una solicitud la puede retirar mientras siga en revisión
create policy "retirar la solicitud en revision" on public.solicitudes_conductor
  for delete using (auth.uid() = usuario_id and estado = 'en_revision');

-- update public.perfiles
--    set rol = 'conductor', chofer_id = 'cho_2', nombre = 'Marvin Lanzas'
--  where id = (select id from auth.users where email = '1002@cuentas.anden.app');

-- 0005
-- copia de los boletos para que el conductor vea quién viaja en su bus
create table public.boletos (
  boleto_id text primary key,
  viaje_id text not null,
  asiento integer not null,
  estado text not null,
  contenido jsonb not null,
  creado_por uuid not null default auth.uid() references auth.users (id),
  actualizado_en timestamptz not null default now()
);

create index boletos_viaje_idx on public.boletos (viaje_id);

alter table public.boletos enable row level security;

create policy "cada quien ve sus boletos" on public.boletos for select
  using (creado_por = auth.uid());
create policy "conductores ven los boletos" on public.boletos for select
  using (public.es_conductor());
create policy "cada quien guarda sus boletos" on public.boletos for insert
  with check (creado_por = auth.uid());
create policy "cada quien actualiza sus boletos" on public.boletos for update
  using (creado_por = auth.uid()) with check (creado_por = auth.uid());
create policy "conductores marcan el uso" on public.boletos for update
  using (public.es_conductor()) with check (public.es_conductor());
