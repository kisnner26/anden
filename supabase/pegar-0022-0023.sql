-- que cada pasajero vea en su boleto lo que el conductor va marcando: si ya subió y si ya pagó
-- (la tabla `abordajes` ya la deja leer a su dueño desde 0008; `pagos` solo la leían los conductores)
drop policy if exists "el dueño ve el pago de su boleto" on public.pagos;
create policy "el dueño ve el pago de su boleto" on public.pagos for select
  using (
    exists (
      select 1 from public.boletos b
      where b.boleto_id = pagos.boleto_id and b.creado_por = auth.uid()
    )
  );

-- avisos en tiempo real cuando el conductor cambia algo (la app además pregunta cada pocos segundos)
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.viajes;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.abordajes;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.pagos;
    exception when duplicate_object then null;
    end;
  end if;
end;
$$;
-- la foto de cada pasajero, para que el conductor sepa a quién espera al verlo en la lista de a bordo
insert into storage.buckets (id, name, public) values ('fotos-pasajeros', 'fotos-pasajeros', true)
on conflict (id) do nothing;

-- cada persona sube y reemplaza solo lo que está en su carpeta (su identificador); la lectura es pública
drop policy if exists "fotos de pasajeros: escribir" on storage.objects;
create policy "fotos de pasajeros: escribir" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'fotos-pasajeros' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "fotos de pasajeros: reemplazar" on storage.objects;
create policy "fotos de pasajeros: reemplazar" on storage.objects
  for update to authenticated using (
    bucket_id = 'fotos-pasajeros' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "fotos de pasajeros: leer" on storage.objects;
create policy "fotos de pasajeros: leer" on storage.objects
  for select using (bucket_id = 'fotos-pasajeros');
