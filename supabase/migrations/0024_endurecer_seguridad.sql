-- endurece los permisos: cada conductor ve y toca solo lo de sus propios viajes, un enlace compartido solo lo
-- crea quien viaja o conduce ese viaje, y las fotos de pasajeros ya no se pueden listar sin cuenta

-- ¿el viaje es de la persona que tiene la sesión abierta? (security definer para no depender de las políticas de perfiles)
create or replace function public.es_chofer_del_viaje(p_viaje text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.viajes v
    join public.perfiles p on p.chofer_id = v.chofer_id
    where v.id = p_viaje and p.id = auth.uid() and p.rol = 'conductor'
  );
$$;
revoke all on function public.es_chofer_del_viaje(text) from public, anon;
grant execute on function public.es_chofer_del_viaje(text) to authenticated;

-- boletos: un conductor ve y marca solo los boletos de sus viajes (antes veía todos los de todas las personas)
drop policy if exists "conductores ven los boletos" on public.boletos;
create policy "conductores ven los boletos de sus viajes" on public.boletos for select
  using (public.es_chofer_del_viaje(viaje_id));
drop policy if exists "conductores marcan el uso" on public.boletos;
create policy "conductores marcan el uso de sus viajes" on public.boletos for update
  using (public.es_chofer_del_viaje(viaje_id)) with check (public.es_chofer_del_viaje(viaje_id));

-- desde la app nadie cambia a qué viaje, asiento o cuenta pertenece un boleto; la transferencia corre con el rol del
-- dueño de la base y sí puede pasarlo a otra cuenta
create or replace function public.boleto_no_se_muda() returns trigger
language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') and (
    new.viaje_id is distinct from old.viaje_id
    or new.asiento is distinct from old.asiento
    or new.creado_por is distinct from old.creado_por
    or new.boleto_id is distinct from old.boleto_id
  ) then
    raise exception 'un boleto no cambia de viaje, asiento ni dueño desde la app';
  end if;
  return new;
end;
$$;
drop trigger if exists boleto_no_se_muda on public.boletos;
create trigger boleto_no_se_muda before update on public.boletos
  for each row execute function public.boleto_no_se_muda();

-- pagos y abordajes: solo el conductor del viaje al que pertenece el boleto
drop policy if exists "conductores leen pagos" on public.pagos;
create policy "conductores leen pagos de sus viajes" on public.pagos for select using (
  exists (select 1 from public.boletos b where b.boleto_id = pagos.boleto_id and public.es_chofer_del_viaje(b.viaje_id))
);
drop policy if exists "conductores marcan pagos" on public.pagos;
create policy "conductores marcan pagos de sus viajes" on public.pagos for all
  using (exists (select 1 from public.boletos b where b.boleto_id = pagos.boleto_id and public.es_chofer_del_viaje(b.viaje_id)))
  with check (exists (select 1 from public.boletos b where b.boleto_id = pagos.boleto_id and public.es_chofer_del_viaje(b.viaje_id)));

drop policy if exists "conductores y dueños ven el abordaje" on public.abordajes;
create policy "conductores y dueños ven el abordaje" on public.abordajes for select using (
  exists (
    select 1 from public.boletos b
    where b.boleto_id = abordajes.boleto_id
      and (b.creado_por = auth.uid() or public.es_chofer_del_viaje(b.viaje_id))
  )
);
drop policy if exists "conductores marcan el abordaje" on public.abordajes;
create policy "conductores marcan el abordaje de sus viajes" on public.abordajes for all
  using (exists (select 1 from public.boletos b where b.boleto_id = abordajes.boleto_id and public.es_chofer_del_viaje(b.viaje_id)))
  with check (exists (select 1 from public.boletos b where b.boleto_id = abordajes.boleto_id and public.es_chofer_del_viaje(b.viaje_id)));

-- transmisión en vivo: solo del viaje que uno conduce (antes podía abrir la de un viaje ajeno que aún no tuviera fila)
drop policy if exists "el conductor transmite su viaje" on public.transmisiones;
create policy "el conductor transmite su viaje" on public.transmisiones for all
  using (
    public.es_conductor()
    and chofer_id = (select chofer_id from public.perfiles where id = auth.uid())
  )
  with check (
    public.es_conductor()
    and chofer_id = (select chofer_id from public.perfiles where id = auth.uid())
    and public.es_chofer_del_viaje(viaje_id)
  );

-- enlace para seguir un viaje: solo lo crea quien tiene boleto en ese viaje o lo conduce
create or replace function public.crear_compartido(
  p_viaje_id text,
  p_nombre text,
  p_origen text,
  p_destino text,
  p_horas integer default 12
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text := replace(gen_random_uuid()::text, '-', '');
begin
  if auth.uid() is null then
    raise exception 'hace falta una cuenta';
  end if;
  if not (
    exists (
      select 1 from public.boletos
      where viaje_id = p_viaje_id and creado_por = auth.uid() and estado <> 'cancelado'
    )
    or public.es_chofer_del_viaje(p_viaje_id)
  ) then
    raise exception 'solo quien viaja o conduce puede compartir este viaje';
  end if;
  insert into public.compartidos (token, viaje_id, nombre, origen, destino, creado_por, expira_en)
  values (
    v_token,
    p_viaje_id,
    left(trim(p_nombre), 40),
    left(trim(p_origen), 60),
    left(trim(p_destino), 60),
    auth.uid(),
    now() + make_interval(hours => least(greatest(p_horas, 1), 48))
  );
  return v_token;
end;
$$;

-- fotos de pasajeros: la lectura por enlace sigue abierta (el bucket es público) pero ya no se pueden listar todas
drop policy if exists "fotos de pasajeros: leer" on storage.objects;
create policy "fotos de pasajeros: leer las propias" on storage.objects
  for select to authenticated using (
    bucket_id = 'fotos-pasajeros' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- las funciones de cuenta no se llaman sin sesión
revoke all on function public.crear_transferencia(text) from public, anon;
revoke all on function public.estado_transferencia(text) from public, anon;
revoke all on function public.reclamar_transferencia(text) from public, anon;
revoke all on function public.cancelar_transferencia(text) from public, anon;
revoke all on function public.crear_compartido(text, text, text, text, integer) from public, anon;
grant execute on function public.crear_compartido(text, text, text, text, integer) to authenticated;
