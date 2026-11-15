-- que cada pasajero vea en su boleto lo que el conductor va marcando: si ya subió y si ya pagó
-- (la tabla `abordajes` ya la deja leer a su dueño desde 0008; `pagos` solo la leían los conductores)
drop policy if exists "el dueño ve el pago de su boleto" on public.pagos;
create policy "el dueño ve el pago de su boleto" on public.pagos for select
  using (
    exists (
      select 1 from public.boletos b
      where b.boleto_id = pagos.boleto_id and b.creado_por = auth.uid()
    )
  );

-- avisos en tiempo real cuando el conductor cambia algo (la app además pregunta cada pocos segundos)
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.viajes;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.abordajes;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.pagos;
    exception when duplicate_object then null;
    end;
  end if;
end;
$$;
