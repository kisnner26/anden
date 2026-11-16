-- el chat se abre cuando el chofer registra la salida del viaje o cuando su unidad comparte la ruta; antes solo valía
-- lo segundo y un viaje iniciado sin compartir la ruta rechazaba todos los mensajes

create or replace function public.viaje_en_camino(p_viaje text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.transmisiones t where t.viaje_id = p_viaje)
    or exists (
      select 1 from public.viajes v
      where v.id = p_viaje and v.salio_en is not null and v.estado not in ('cancelado', 'llego')
    );
$$;
revoke all on function public.viaje_en_camino(text) from public, anon;
grant execute on function public.viaje_en_camino(text) to authenticated;
