-- las encomiendas viajan en un bus concreto: el chofer de ese viaje las ve, las acepta o rechaza con un motivo
-- y marca cuándo las recibió y cuándo las entregó; quien las envía sigue el estado desde su teléfono
create table if not exists public.encomiendas (
  id text primary key,
  viaje_id text,
  chofer_id text,
  estado text not null default 'solicitada'
    check (estado in ('solicitada', 'aceptada', 'rechazada', 'recibida', 'entregada', 'cancelada')),
  motivo text,
  contenido jsonb not null,
  remitente_id uuid not null default auth.uid() references auth.users (id),
  creada_en timestamptz not null default now(),
  actualizada_en timestamptz not null default now()
);

create index if not exists encomiendas_chofer_idx on public.encomiendas (chofer_id);
create index if not exists encomiendas_remitente_idx on public.encomiendas (remitente_id);

alter table public.encomiendas enable row level security;

drop policy if exists "el remitente ve sus encomiendas" on public.encomiendas;
create policy "el remitente ve sus encomiendas" on public.encomiendas
  for select using (remitente_id = auth.uid());

drop policy if exists "el chofer ve las encomiendas de sus viajes" on public.encomiendas;
create policy "el chofer ve las encomiendas de sus viajes" on public.encomiendas
  for select using (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol = 'conductor' and p.chofer_id = encomiendas.chofer_id
    )
  );

drop policy if exists "cada quien envía sus encomiendas" on public.encomiendas;
create policy "cada quien envía sus encomiendas" on public.encomiendas
  for insert with check (remitente_id = auth.uid() and estado = 'solicitada');

drop policy if exists "el remitente cancela la suya" on public.encomiendas;
create policy "el remitente cancela la suya" on public.encomiendas
  for update using (remitente_id = auth.uid() and estado = 'solicitada')
  with check (remitente_id = auth.uid() and estado = 'cancelada');

drop policy if exists "el chofer actualiza el estado" on public.encomiendas;
create policy "el chofer actualiza el estado" on public.encomiendas
  for update using (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol = 'conductor' and p.chofer_id = encomiendas.chofer_id
    )
  ) with check (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol = 'conductor' and p.chofer_id = encomiendas.chofer_id
    )
  );
