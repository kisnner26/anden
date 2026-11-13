-- solicitudes para ser conductor: cédula y fotos de sus dos lados; las revisa la cooperativa, no la app
create type public.estado_solicitud as enum ('en_revision', 'aprobada', 'rechazada');

create table public.solicitudes_conductor (
  usuario_id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  apellido text not null,
  telefono text not null,
  cedula text not null check (cedula ~ '^[0-9]{3}-[0-9]{6}-[0-9]{4}[A-Z]$'),
  foto_frente text not null,
  foto_dorso text not null,
  biometria_confirmada boolean not null default false check (biometria_confirmada),
  estado public.estado_solicitud not null default 'en_revision',
  creada_en timestamptz not null default now(),
  revisada_en timestamptz,
  unique (cedula)
);

alter table public.solicitudes_conductor enable row level security;

create policy "cada quien ve su solicitud" on public.solicitudes_conductor
  for select using (auth.uid() = usuario_id);

-- solo se puede crear en revisión; aprobar o rechazar lo hace el servidor con la llave de servicio
create policy "cada quien envia su solicitud" on public.solicitudes_conductor
  for insert with check (auth.uid() = usuario_id and estado = 'en_revision');

-- fotos de la cédula en un bucket privado: cada persona solo lee y escribe su propia carpeta
insert into storage.buckets (id, name, public) values ('cedulas', 'cedulas', false)
on conflict (id) do nothing;

create policy "fotos de cedula propias: escribir" on storage.objects
  for insert with check (
    bucket_id = 'cedulas' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "fotos de cedula propias: leer" on storage.objects
  for select using (
    bucket_id = 'cedulas' and (storage.foldername(name))[1] = auth.uid()::text
  );
