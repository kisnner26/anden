-- el punto donde se sube al bus ahora es un Plus Code (el código de Google Maps) y no un número de andén
alter table public.viajes add column if not exists punto_encuentro text;

-- los viajes nuevos ya no llevan número de andén; los viejos lo conservan pero la app no lo muestra
alter table public.viajes alter column anden drop not null;
alter table public.viajes drop constraint if exists viajes_anden_check;

-- un Plus Code completo: ocho signos, el signo +, y de dos a siete signos más
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'viajes_punto_encuentro_formato'
  ) then
    alter table public.viajes add constraint viajes_punto_encuentro_formato check (
      punto_encuentro is null
      or punto_encuentro ~ '^[23456789CFGHJMPQRVWX]{8}\+[23456789CFGHJMPQRVWX]{2,7}$'
    );
  end if;
end;
$$;
