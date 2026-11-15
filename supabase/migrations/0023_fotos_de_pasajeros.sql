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
