-- reserva en grupo: quien organiza crea un enlace para un viaje, cada amigo entra con su cuenta, elige su asiento y paga el suyo;
-- el grupo solo reúne el avance (quién ya eligió y dónde) para que todos queden juntos

create table if not exists public.grupos_viaje (
  codigo text primary key,
  viaje_id text not null,
  cupo integer not null check (cupo between 2 and 6),
  creado_por uuid not null default auth.uid() references auth.users (id),
  creado_en timestamptz not null default now(),
  expira_en timestamptz not null
);
create index if not exists grupos_viaje_viaje_idx on public.grupos_viaje (viaje_id);
alter table public.grupos_viaje enable row level security;
drop policy if exists "quien organiza ve su grupo" on public.grupos_viaje;
create policy "quien organiza ve su grupo" on public.grupos_viaje for select using (creado_por = auth.uid());

-- crea el grupo con un código que no se puede adivinar; vale una hora, o hasta la salida si es antes
create or replace function public.crear_grupo(p_viaje text, p_cupo integer) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_codigo text := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  v_salida timestamptz;
begin
  if auth.uid() is null then
    raise exception 'hace falta una cuenta';
  end if;
  select salida into v_salida from public.viajes where id = p_viaje and estado <> 'cancelado';
  if v_salida is null or v_salida <= now() then
    raise exception 'el viaje no existe o ya salió';
  end if;
  insert into public.grupos_viaje (codigo, viaje_id, cupo, creado_por, expira_en)
  values (v_codigo, p_viaje, least(greatest(p_cupo, 2), 6), auth.uid(), least(now() + interval '1 hour', v_salida));
  return v_codigo;
end;
$$;

-- lo que ve quien abre el enlace: el viaje, el cupo y quiénes ya eligieron, solo con el primer nombre y el asiento
create or replace function public.ver_grupo(p_codigo text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'viaje_id', g.viaje_id,
    'cupo', g.cupo,
    'expira_en', g.expira_en,
    'vencido', g.expira_en <= now(),
    'miembros', coalesce((
      select jsonb_agg(jsonb_build_object(
        'nombre', split_part(coalesce(b.contenido -> 'boleto' -> 'pasajero' ->> 'nombre', ''), ' ', 1),
        'asiento', b.asiento
      ) order by b.asiento)
      from public.boletos b
      where b.viaje_id = g.viaje_id
        and b.estado <> 'cancelado'
        and b.contenido -> 'resumen' ->> 'grupo' = g.codigo
    ), '[]'::jsonb)
  )
  from public.grupos_viaje g
  where g.codigo = upper(trim(p_codigo)) and auth.uid() is not null;
$$;

revoke all on function public.crear_grupo(text, integer) from public, anon;
revoke all on function public.ver_grupo(text) from public, anon;
grant execute on function public.crear_grupo(text, integer) to authenticated;
grant execute on function public.ver_grupo(text) to authenticated;
