-- Borra todos los viajes de un chofer, con sus boletos, pagos, abordajes y transmisión, para empezar
-- pruebas limpias. Cambiá 'cho_1' por el código del chofer (el de la columna chofer_id de perfiles).
-- Corrélo en el editor de SQL de Supabase. No se puede deshacer.
do $$
declare
  chofer text := 'cho_1';
begin
  delete from public.abordajes where boleto_id in (
    select boleto_id from public.boletos where viaje_id in (select id from public.viajes where chofer_id = chofer)
  );
  delete from public.pagos where boleto_id in (
    select boleto_id from public.boletos where viaje_id in (select id from public.viajes where chofer_id = chofer)
  );
  delete from public.boletos where viaje_id in (select id from public.viajes where chofer_id = chofer);
  delete from public.cierres where chofer_id = chofer;
  delete from public.transmisiones where chofer_id = chofer;
  delete from public.viajes where chofer_id = chofer;
end $$;
