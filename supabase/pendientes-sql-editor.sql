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
