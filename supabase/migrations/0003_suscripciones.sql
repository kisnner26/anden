-- Andén Plus: la suscripción mensual de 5 dólares; la confirma el servidor, nunca la app
create table public.suscripciones (
  usuario_id uuid primary key references public.perfiles (id) on delete cascade,
  plan text not null default 'gratis' check (plan in ('gratis', 'plus')),
  desde timestamptz,
  vence_en timestamptz,
  constraint plus_con_fecha check (plan = 'gratis' or desde is not null)
);

alter table public.suscripciones enable row level security;

-- cada quien lee su estado; escribir solo desde el servidor (llave de servicio o webhook de la tienda)
create policy "cada quien lee su suscripcion" on public.suscripciones
  for select using (auth.uid() = usuario_id);
