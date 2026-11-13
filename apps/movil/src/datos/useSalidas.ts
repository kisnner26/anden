import { useEffect, useMemo, useState } from 'react';

import { haySupabase } from '@/servicios/supabase/cliente';

import { crearBase, crearMuestra, type DatosMuestra } from './muestra';
import {
  armarSalidas,
  armarTodasLasSalidas,
  proximaSalida,
  salidasDelDia,
} from './salidas';

const MEDIO_MINUTO = 30_000;

let muestra: DatosMuestra | null = null;

/**
 * los datos de la sesión, creados una sola vez para que todas las pantallas vean lo mismo. Con
 * servidor arrancan sin viajes y se llenan con lo que publican los conductores; sin servidor
 * (pruebas y desarrollo sin conexión) se usan los viajes de muestra.
 */
export function obtenerMuestra(): DatosMuestra {
  muestra ??= haySupabase() ? crearBase() : crearMuestra(new Date());
  return muestra;
}

const oyentes = new Set<() => void>();

/** avisa a las pantallas que los viajes o los asientos cambiaron */
export function notificarCambioDeViajes(): void {
  for (const oyente of oyentes) oyente();
}

/** reinicia la muestra; solo lo usan las pruebas */
export function reiniciarMuestra(): void {
  muestra = null;
}

/** la hora actual, refrescada cada medio minuto */
export function useAhora(intervalo: number = MEDIO_MINUTO): Date {
  const [ahora, establecerAhora] = useState(() => new Date());
  // cuando llegan viajes nuevos del servidor la hora se renueva, y con ella todo lo que se calcula de las salidas
  useEffect(() => {
    const alCambiar = () => establecerAhora(new Date());
    oyentes.add(alCambiar);
    return () => {
      oyentes.delete(alCambiar);
    };
  }, []);
  useEffect(() => {
    const temporizador = setInterval(
      () => establecerAhora(new Date()),
      intervalo,
    );
    return () => clearInterval(temporizador);
  }, [intervalo]);
  return ahora;
}

/**
 * las salidas de una terminal (o de todas si no se indica) con la hora actual refrescada.
 * Sin `dia` trae todos los días reservables, que es lo que necesita quien busca un viaje por su id;
 * con `dia` trae solo las de ese día, para las listas.
 */
export function useSalidas(origenId?: string, dia?: Date) {
  const ahora = useAhora();
  const datos = obtenerMuestra();
  const todas = useMemo(
    () =>
      origenId
        ? armarSalidas(datos, ahora, origenId)
        : armarTodasLasSalidas(datos, ahora),
    [datos, ahora, origenId],
  );
  const marcaDia = dia?.getTime();
  const salidas = useMemo(
    () =>
      marcaDia === undefined ? todas : salidasDelDia(todas, new Date(marcaDia)),
    [marcaDia, todas],
  );
  const proxima = useMemo(() => proximaSalida(todas), [todas]);
  return { ahora, datos, proxima, salidas };
}
