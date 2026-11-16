-- mensajes entre el chofer y cada pasajero, solo mientras el viaje está en camino (su unidad comparte la ruta);
-- cada pasajero tiene su propia conversación con el chofer, identificada por su boleto

create table if not exists public.mensajes_viaje (
  id uuid primary key default gen_random_uuid(),
  viaje_id text not null,
  hilo text not null,
  de text not null check (de in ('chofer', 'pasajero')),
  texto text not null check (char_length(texto) between 1 and 240),
  autor uuid not null default auth.uid() references auth.users (id),
  enviado_en timestamptz not null default now()
);
create index if not exists mensajes_viaje_hilo_idx on public.mensajes_viaje (viaje_id, hilo, enviado_en);
alter table public.mensajes_viaje enable row level security;

-- el viaje va en camino cuando su unidad está transmitiendo la ruta
create or replace function public.viaje_en_camino(p_viaje text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.transmisiones t where t.viaje_id = p_viaje);
$$;
revoke all on function public.viaje_en_camino(text) from public, anon;
grant execute on function public.viaje_en_camino(text) to authenticated;

-- quien tiene ese boleto, sin cancelar, en ese viaje
create or replace function public.es_dueno_del_boleto(p_viaje text, p_hilo text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.boletos b
    where b.boleto_id = p_hilo and b.viaje_id = p_viaje and b.creado_por = auth.uid() and b.estado <> 'cancelado'
  );
$$;
revoke all on function public.es_dueno_del_boleto(text, text) from public, anon;
grant execute on function public.es_dueno_del_boleto(text, text) to authenticated;

drop policy if exists "chofer y pasajero escriben con el viaje en camino" on public.mensajes_viaje;
create policy "chofer y pasajero escriben con el viaje en camino" on public.mensajes_viaje for insert with check (
  autor = auth.uid()
  and public.viaje_en_camino(viaje_id)
  and (
    (de = 'chofer' and public.es_chofer_del_viaje(viaje_id)
      and exists (select 1 from public.boletos b where b.boleto_id = hilo and b.viaje_id = mensajes_viaje.viaje_id))
    or (de = 'pasajero' and public.es_dueno_del_boleto(viaje_id, hilo))
  )
);

drop policy if exists "chofer y pasajero leen su conversación" on public.mensajes_viaje;
create policy "chofer y pasajero leen su conversación" on public.mensajes_viaje for select using (
  public.es_chofer_del_viaje(viaje_id) or public.es_dueno_del_boleto(viaje_id, hilo)
);

drop policy if exists "cooperativa lee mensajes_viaje" on public.mensajes_viaje;
create policy "cooperativa lee mensajes_viaje" on public.mensajes_viaje for select using (public.es_cooperativa());
