-- el interlocal no tiene hora fija: sale cuando se llena. `salida` es la hora en que se pone a esperar
-- pasajeros y `salio_en` la hora en que de verdad arrancó, que alimenta las estimaciones
alter table public.viajes add column if not exists salio_en timestamptz;
