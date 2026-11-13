-- lo que el pasajero ve de su chofer: nombre y foto, publicados por el propio conductor
create table if not exists public.perfiles_chofer (
  chofer_id text primary key,
  nombre text not null,
  foto_url text,
  actualizado_en timestamptz not null default now()
);

alter table public.perfiles_chofer enable row level security;

drop policy if exists "cualquiera ve al chofer" on public.perfiles_chofer;
create policy "cualquiera ve al chofer" on public.perfiles_chofer
  for select using (true);

drop policy if exists "el conductor publica su perfil" on public.perfiles_chofer;
create policy "el conductor publica su perfil" on public.perfiles_chofer
  for insert with check (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol = 'conductor' and p.chofer_id = perfiles_chofer.chofer_id
    )
  );

drop policy if exists "el conductor edita su perfil" on public.perfiles_chofer;
create policy "el conductor edita su perfil" on public.perfiles_chofer
  for update using (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol = 'conductor' and p.chofer_id = perfiles_chofer.chofer_id
    )
  ) with check (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol = 'conductor' and p.chofer_id = perfiles_chofer.chofer_id
    )
  );

-- fotos de los choferes: se leen sin sesión; cada conductor solo escribe en su carpeta
insert into storage.buckets (id, name, public) values ('fotos-choferes', 'fotos-choferes', true)
on conflict (id) do nothing;

drop policy if exists "fotos de choferes: escribir" on storage.objects;
create policy "fotos de choferes: escribir" on storage.objects
  for all using (
    bucket_id = 'fotos-choferes' and exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol = 'conductor' and p.chofer_id = (storage.foldername(name))[1]
    )
  ) with check (
    bucket_id = 'fotos-choferes' and exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol = 'conductor' and p.chofer_id = (storage.foldername(name))[1]
    )
  );
