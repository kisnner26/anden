import { useEffect, useState } from 'react';

import { leerBoletosDelViaje } from '@/servicios/supabase/boletosCompartidos';

import type { BoletoGuardado } from './reserva';

const CADA_MS = 5000;

/** une los boletos de este teléfono con los que subieron los pasajeros; gana el estado más reciente de cada uno */
export function unirBoletos(
  locales: readonly BoletoGuardado[],
  remotos: readonly BoletoGuardado[],
): BoletoGuardado[] {
  const porId = new Map<string, BoletoGuardado>();
  for (const guardado of remotos) porId.set(guardado.boleto.id, guardado);
  for (const guardado of locales) porId.set(guardado.boleto.id, guardado);
  return [...porId.values()];
}

/** los boletos de un viaje que el conductor ve en su pantalla, renovados cada pocos segundos; `fallo` si el servidor no respondió */
export function useBoletosDelViaje(viajeId: string): {
  boletos: BoletoGuardado[];
  fallo: boolean;
} {
  const [remotos, establecerRemotos] = useState<BoletoGuardado[]>([]);
  const [fallo, establecerFallo] = useState(false);

  useEffect(() => {
    let vigente = true;
    const traer = () => {
      void leerBoletosDelViaje(viajeId).then((leidos) => {
        if (!vigente) return;
        establecerFallo(leidos === null);
        // si falla una vez se conserva lo último que se vio
        if (leidos !== null) establecerRemotos(leidos);
      });
    };
    traer();
    const temporizador = setInterval(traer, CADA_MS);
    return () => {
      vigente = false;
      clearInterval(temporizador);
    };
  }, [viajeId]);

  return { boletos: remotos, fallo };
}
