-- perfiles: el rol vive aquí y solo lo cambia el servidor; la app nunca lo elige
create type public.rol as enum ('pasajero', 'conductor');

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  rol public.rol not null default 'pasajero',
  chofer_id text unique,
  creado_en timestamptz not null default now(),
  constraint conductor_con_chofer check (rol <> 'conductor' or chofer_id is not null)
);

alter table public.perfiles enable row level security;

create policy "cada quien lee su perfil" on public.perfiles
  for select using (auth.uid() = id);

create policy "cada quien edita su nombre" on public.perfiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    and rol = (select p.rol from public.perfiles p where p.id = auth.uid())
    and chofer_id is not distinct from (select p.chofer_id from public.perfiles p where p.id = auth.uid())
  );

-- toda cuenta nueva nace pasajera; un conductor lo asigna el operador desde el panel
create function public.crear_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger al_crear_usuario after insert on auth.users
  for each row execute function public.crear_perfil();
