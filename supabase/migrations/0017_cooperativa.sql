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
