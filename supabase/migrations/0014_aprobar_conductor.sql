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
