-- objetos olvidados en el bus: el chofer los fotografía y quien viajó los reconoce y los reclama desde la app

insert into storage.buckets (id, name, public) values ('objetos-perdidos', 'objetos-perdidos', true)
on conflict (id) do nothing;

-- cada chofer sube solo a su carpeta; la foto se ve con su enlace, pero no se puede listar el bucket
drop policy if exists "objetos perdidos: subir" on storage.objects;
create policy "objetos perdidos: subir" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'objetos-perdidos' and (storage.foldername(name))[1] = auth.uid()::text
  );

create table if not exists public.objetos_perdidos (
  id uuid primary key default gen_random_uuid(),
  viaje_id text not null,
  descripcion text not null check (char_length(descripcion) between 1 and 120),
  foto_url text,
  reportado_por uuid not null default auth.uid() references auth.users (id),
  creado_en timestamptz not null default now(),
  reclamado_por uuid references auth.users (id),
  reclamado_en timestamptz
);
create index if not exists objetos_perdidos_viaje_idx on public.objetos_perdidos (viaje_id, creado_en desc);
alter table public.objetos_perdidos enable row level security;

drop policy if exists "el chofer reporta un objeto de su viaje" on public.objetos_perdidos;
create policy "el chofer reporta un objeto de su viaje" on public.objetos_perdidos for insert
  with check (reportado_por = auth.uid() and public.es_chofer_del_viaje(viaje_id));

drop policy if exists "chofer y pasajeros ven los objetos del viaje" on public.objetos_perdidos;
create policy "chofer y pasajeros ven los objetos del viaje" on public.objetos_perdidos for select using (
  public.es_chofer_del_viaje(viaje_id)
  or exists (
    select 1 from public.boletos b
    where b.viaje_id = objetos_perdidos.viaje_id and b.creado_por = auth.uid() and b.estado <> 'cancelado'
  )
);

drop policy if exists "cooperativa lee objetos_perdidos" on public.objetos_perdidos;
create policy "cooperativa lee objetos_perdidos" on public.objetos_perdidos for select using (public.es_cooperativa());

-- quien tuvo boleto en ese viaje dice "es mío"; el primero que lo reclama se lo queda y el chofer lo ve
create or replace function public.reclamar_objeto(p_id uuid) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_filas integer;
begin
  update public.objetos_perdidos o
  set reclamado_por = auth.uid(), reclamado_en = now()
  where o.id = p_id
    and o.reclamado_por is null
    and exists (
      select 1 from public.boletos b
      where b.viaje_id = o.viaje_id and b.creado_por = auth.uid() and b.estado <> 'cancelado'
    );
  get diagnostics v_filas = row_count;
  return v_filas > 0;
end;
$$;
revoke all on function public.reclamar_objeto(uuid) from public, anon;
grant execute on function public.reclamar_objeto(uuid) to authenticated;
