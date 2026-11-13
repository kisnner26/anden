-- cuentas con usuario y teléfono: se entra con usuario, teléfono o código, nunca con correo
alter table public.perfiles
  add column usuario text unique,
  add column apellido text,
  add column telefono text unique;

alter table public.perfiles
  add constraint usuario_con_formato check (usuario is null or usuario ~ '^[a-z0-9][a-z0-9._]{2,19}$');

create or replace function public.crear_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, nombre, apellido, usuario, telefono)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'apellido', ''),
    nullif(lower(new.raw_user_meta_data ->> 'usuario'), ''),
    nullif(new.raw_user_meta_data ->> 'telefono', '')
  );
  return new;
end;
$$;

-- el correo que usa Supabase por dentro para un usuario, un teléfono o un código; la app nunca lo muestra
create function public.correo_de_acceso(p_identificador text) returns text
language sql stable security definer set search_path = public, auth as $$
  select coalesce(
    (select u.email::text from public.perfiles p join auth.users u on u.id = p.id
      where p.usuario = lower(trim(p_identificador))
         or p.telefono = regexp_replace(p_identificador, '\D', '', 'g')
      limit 1),
    lower(regexp_replace(trim(p_identificador), '\s|-', '', 'g')) || '@cuentas.anden.app'
  );
$$;

-- antes de crear la cuenta: si el usuario o el teléfono ya existen
create function public.acceso_disponible(p_usuario text, p_telefono text) returns text
language sql stable security definer set search_path = public as $$
  select case
    when exists (select 1 from public.perfiles where usuario = lower(trim(p_usuario))) then 'usuario'
    when exists (select 1 from public.perfiles where telefono = p_telefono) then 'telefono'
    else 'libre'
  end;
$$;

grant execute on function public.correo_de_acceso(text) to anon, authenticated;
grant execute on function public.acceso_disponible(text, text) to anon, authenticated;
