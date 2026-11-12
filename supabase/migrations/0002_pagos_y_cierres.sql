-- pagos en efectivo marcados por el conductor y cierre de cada viaje
create table public.pagos (
  boleto_id text primary key,
  estado text not null check (estado in ('pendiente', 'pagado_efectivo')),
  marcado_por text references public.perfiles (chofer_id),
  marcado_en timestamptz
);

create table public.cierres (
  viaje_id text primary key,
  chofer_id text not null references public.perfiles (chofer_id),
  cobrado integer not null check (cobrado >= 0),
  cerrado_en timestamptz not null default now()
);

alter table public.pagos enable row level security;
alter table public.cierres enable row level security;

create function public.es_conductor() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and rol = 'conductor');
$$;

create policy "conductores leen pagos" on public.pagos for select using (public.es_conductor());
create policy "conductores marcan pagos" on public.pagos for all
  using (public.es_conductor()) with check (public.es_conductor());
create policy "conductores leen cierres" on public.cierres for select using (public.es_conductor());
create policy "conductores cierran su viaje" on public.cierres for insert
  with check (
    public.es_conductor()
    and chofer_id = (select chofer_id from public.perfiles where id = auth.uid())
  );
