-- ubicación del bus en vivo: una fila por viaje mientras el conductor transmite
create table public.transmisiones (
  viaje_id text primary key,
  chofer_id text not null references public.perfiles (chofer_id),
  lat double precision,
  lng double precision,
  velocidad_ms double precision,
  registrada_en timestamptz not null default now()
);

alter table public.transmisiones enable row level security;

create policy "quien tiene cuenta ve los buses en camino" on public.transmisiones
  for select using (auth.uid() is not null);
create policy "el conductor transmite su viaje" on public.transmisiones for all
  using (
    public.es_conductor()
    and chofer_id = (select chofer_id from public.perfiles where id = auth.uid())
  )
  with check (
    public.es_conductor()
    and chofer_id = (select chofer_id from public.perfiles where id = auth.uid())
  );

-- quién ya subió al bus
create table public.abordajes (
  boleto_id text primary key,
  marcado_por text references public.perfiles (chofer_id),
  marcado_en timestamptz not null default now()
);

alter table public.abordajes enable row level security;

create policy "conductores y dueños ven el abordaje" on public.abordajes for select
  using (
    public.es_conductor()
    or exists (
      select 1 from public.boletos b
      where b.boleto_id = abordajes.boleto_id and b.creado_por = auth.uid()
    )
  );
create policy "conductores marcan el abordaje" on public.abordajes for all
  using (public.es_conductor()) with check (public.es_conductor());

-- quien envió una solicitud la puede retirar mientras siga en revisión
create policy "retirar la solicitud en revision" on public.solicitudes_conductor
  for delete using (auth.uid() = usuario_id and estado = 'en_revision');
