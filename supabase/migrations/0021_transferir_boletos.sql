-- pasar un boleto vigente a otra persona: quien lo tiene genera un código corto, la otra persona lo canjea
-- (por AirDrop, Quick Share, mensaje o dictándolo en persona) y el boleto pasa a su cuenta con su nombre

create table public.transferencias (
  codigo text primary key,
  boleto_id text not null references public.boletos (boleto_id) on delete cascade,
  de uuid not null default auth.uid() references auth.users (id),
  para uuid references auth.users (id),
  para_nombre text,
  creada_en timestamptz not null default now(),
  expira_en timestamptz not null,
  reclamada_en timestamptz,
  cancelada_en timestamptz
);

create index transferencias_boleto_idx on public.transferencias (boleto_id);

alter table public.transferencias enable row level security;

-- quien ofrece el boleto ve sus transferencias; nadie las crea ni las cambia a mano, solo las funciones de abajo
create policy "cada quien ve las que ofreció" on public.transferencias for select
  using (de = auth.uid());

-- 8 signos sin letras que se confunden (sin 0, O, 1, I, L), generados con aleatoriedad del servidor
create or replace function public.codigo_de_transferencia() returns text
language plpgsql
volatile
as $$
declare
  v_alfabeto constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_hex text := replace(gen_random_uuid()::text, '-', '');
  v_codigo text := '';
  v_i integer;
begin
  for v_i in 0..7 loop
    v_codigo := v_codigo || substr(
      v_alfabeto,
      1 + (('x' || substr(v_hex, v_i * 2 + 1, 2))::bit(8)::integer % length(v_alfabeto)),
      1
    );
  end loop;
  return v_codigo;
end;
$$;

-- ofrece un boleto vigente propio; vale 30 minutos y reemplaza cualquier oferta anterior del mismo boleto
create or replace function public.crear_transferencia(p_boleto_id text) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_codigo text;
begin
  if auth.uid() is null then
    raise exception 'hace falta una cuenta';
  end if;
  if not exists (
    select 1 from public.boletos
    where boleto_id = p_boleto_id and creado_por = auth.uid() and estado = 'vigente'
  ) then
    raise exception 'el boleto no es tuyo o ya no está vigente';
  end if;

  update public.transferencias set cancelada_en = now()
  where boleto_id = p_boleto_id and reclamada_en is null and cancelada_en is null;

  v_codigo := public.codigo_de_transferencia();
  insert into public.transferencias (codigo, boleto_id, de, expira_en)
  values (v_codigo, p_boleto_id, auth.uid(), now() + interval '30 minutes');
  return v_codigo;
end;
$$;

-- lo que ve quien ofreció el boleto: si sigue esperando, si ya lo recibieron (y quién) o si venció
create or replace function public.estado_transferencia(p_codigo text) returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select jsonb_build_object(
        'estado',
          case
            when t.reclamada_en is not null then 'reclamada'
            when t.cancelada_en is not null then 'cancelada'
            when t.expira_en <= now() then 'vencida'
            else 'pendiente'
          end,
        'para_nombre', split_part(coalesce(t.para_nombre, ''), ' ', 1),
        'expira_en', t.expira_en
      )
      from public.transferencias t
      where t.codigo = p_codigo and t.de = auth.uid()
    ),
    jsonb_build_object('estado', 'inexistente')
  );
$$;

-- canjea el código: el boleto pasa a la cuenta de quien lo canjea, con su nombre, y devuelve el boleto para guardarlo
create or replace function public.reclamar_transferencia(p_codigo text) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_t public.transferencias;
  v_nombre text;
  v_contenido jsonb;
begin
  if auth.uid() is null then
    raise exception 'hace falta una cuenta';
  end if;
  select * into v_t from public.transferencias where codigo = upper(trim(p_codigo)) for update;
  if not found then
    return jsonb_build_object('error', 'no-existe');
  end if;
  if v_t.reclamada_en is not null or v_t.cancelada_en is not null then
    return jsonb_build_object('error', 'ya-usada');
  end if;
  if v_t.expira_en <= now() then
    return jsonb_build_object('error', 'vencida');
  end if;
  if v_t.de = auth.uid() then
    return jsonb_build_object('error', 'propia');
  end if;

  select nombre into v_nombre from public.perfiles where id = auth.uid();
  update public.boletos
  set creado_por = auth.uid(),
      contenido = jsonb_set(contenido, '{boleto,pasajero,nombre}', to_jsonb(coalesce(v_nombre, 'Pasajero'))),
      actualizado_en = now()
  where boleto_id = v_t.boleto_id and estado = 'vigente'
  returning contenido into v_contenido;
  if v_contenido is null then
    return jsonb_build_object('error', 'ya-usada');
  end if;

  update public.transferencias
  set para = auth.uid(), para_nombre = v_nombre, reclamada_en = now()
  where codigo = v_t.codigo;
  return jsonb_build_object('boleto', v_contenido);
end;
$$;

create or replace function public.cancelar_transferencia(p_codigo text) returns void
language sql
security definer
set search_path = public
as $$
  update public.transferencias set cancelada_en = now()
  where codigo = p_codigo and de = auth.uid() and reclamada_en is null and cancelada_en is null;
$$;

revoke execute on function public.codigo_de_transferencia() from public, anon, authenticated;
grant execute on function public.crear_transferencia(text) to authenticated;
grant execute on function public.estado_transferencia(text) to authenticated;
grant execute on function public.reclamar_transferencia(text) to authenticated;
grant execute on function public.cancelar_transferencia(text) to authenticated;
