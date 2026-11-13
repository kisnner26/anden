-- qué asientos de un viaje ya están vendidos, sin mostrar de quién son: así todos los teléfonos ven lo mismo
create or replace function public.asientos_ocupados(p_viaje text) returns setof integer
language sql stable security definer set search_path = public as $$
  select asiento from public.boletos where viaje_id = p_viaje and estado <> 'cancelado';
$$;

revoke all on function public.asientos_ocupados(text) from public;
grant execute on function public.asientos_ocupados(text) to authenticated;
