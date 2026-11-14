-- enlaces para que un familiar siga un viaje sin tener la app: cada enlace es un código largo que solo
-- conoce quien lo recibe, vence solo y muestra únicamente lo mínimo (ruta, bus, hora y por dónde va)
create table public.compartidos (
  token text primary key,
  viaje_id text not null,
  nombre text not null,
  origen text not null,
  destino text not null,
  creado_por uuid not null default auth.uid() references auth.users (id),
  creado_en timestamptz not null default now(),
  expira_en timestamptz not null
);

create index compartidos_viaje_idx on public.compartidos (viaje_id);

alter table public.compartidos enable row level security;

-- quien lo creó puede verlo; nadie más lee la tabla, el enlace público pasa solo por la función de abajo
create policy "cada quien ve sus enlaces" on public.compartidos for select
  using (creado_por = auth.uid());

-- crea el enlace con un código generado en el servidor, que no se puede adivinar
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

grant execute on function public.crear_compartido(text, text, text, text, integer) to authenticated;

-- lo que ve quien abre el enlace: sin teléfono, sin cédula, sin código de boleto, solo el viaje
create or replace function public.ver_viaje_compartido(p_token text) returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'nombre', c.nombre,
    'origen', c.origen,
    'destino', c.destino,
    'salida', v.salida,
    'placa', v.placa,
    'servicio', v.servicio,
    'estado', v.estado,
    'salio_en', v.salio_en,
    'lat', t.lat,
    'lng', t.lng,
    'velocidad_ms', t.velocidad_ms,
    'registrada_en', t.registrada_en,
    'expira_en', c.expira_en
  )
  from public.compartidos c
  join public.viajes v on v.id = c.viaje_id
  left join public.transmisiones t on t.viaje_id = c.viaje_id
  where c.token = p_token and c.expira_en > now();
$$;

grant execute on function public.ver_viaje_compartido(text) to anon, authenticated;
