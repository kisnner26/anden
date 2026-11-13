-- el mismo asiento de un viaje no se puede vender dos veces: lo impide la base, no el teléfono
create unique index boletos_un_asiento_por_viaje
  on public.boletos (viaje_id, asiento)
  where estado <> 'cancelado';
