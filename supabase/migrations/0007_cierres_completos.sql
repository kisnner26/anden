-- el cierre guarda el resumen completo (quién pagó y quién no) y se puede rehacer
alter table public.cierres add column contenido jsonb;

create policy "conductores corrigen su cierre" on public.cierres for update
  using (
    public.es_conductor()
    and chofer_id = (select chofer_id from public.perfiles where id = auth.uid())
  )
  with check (
    public.es_conductor()
    and chofer_id = (select chofer_id from public.perfiles where id = auth.uid())
  );
