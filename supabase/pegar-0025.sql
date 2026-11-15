-- el motivo con que un conductor cancela un viaje con pasajeros: lo ven quienes tenían boleto
alter table public.viajes add column if not exists motivo_cancelacion text
  check (motivo_cancelacion is null or motivo_cancelacion in ('averia', 'clima', 'pocos', 'otro'));
