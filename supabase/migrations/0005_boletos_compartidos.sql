-- copia de los boletos para que el conductor vea quién viaja en su bus
create table public.boletos (
  boleto_id text primary key,
  viaje_id text not null,
  asiento integer not null,
  estado text not null,
  contenido jsonb not null,
  creado_por uuid not null default auth.uid() references auth.users (id),
  actualizado_en timestamptz not null default now()
);

create index boletos_viaje_idx on public.boletos (viaje_id);

alter table public.boletos enable row level security;

create policy "cada quien ve sus boletos" on public.boletos for select
  using (creado_por = auth.uid());
create policy "conductores ven los boletos" on public.boletos for select
  using (public.es_conductor());
create policy "cada quien guarda sus boletos" on public.boletos for insert
  with check (creado_por = auth.uid());
create policy "cada quien actualiza sus boletos" on public.boletos for update
  using (creado_por = auth.uid()) with check (creado_por = auth.uid());
create policy "conductores marcan el uso" on public.boletos for update
  using (public.es_conductor()) with check (public.es_conductor());
