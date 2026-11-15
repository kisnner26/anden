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
