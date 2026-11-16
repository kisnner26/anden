import { useEffect, useMemo, useState } from 'react';

import { leerBoletosDelViaje } from '@/servicios/supabase/boletosCompartidos';

import type { BoletoGuardado } from './reserva';
import { iniciarSondeo } from './sondeo';

const CADA_MS = 8000;

/** los boletos de varios viajes a la vez, renovados cada pocos segundos; los que no respondieron conservan lo último que se vio */
export function useBoletosDeViajes(viajeIds: readonly string[]): {
  boletos: BoletoGuardado[];
  fallo: boolean;
} {
  const clave = viajeIds.join('|');
  const [porViaje, establecerPorViaje] = useState<
    Record<string, BoletoGuardado[]>
  >({});
  const [fallo, establecerFallo] = useState(false);

  useEffect(() => {
    if (clave === '') return;
    const ids = clave.split('|');
    let vigente = true;
    const traer = () => {
      void Promise.all(
        ids.map(async (id) => [id, await leerBoletosDelViaje(id)] as const),
      ).then((resultados) => {
        if (!vigente) return;
        establecerFallo(resultados.some(([, leidos]) => leidos === null));
        establecerPorViaje((previo) => {
          const siguiente = { ...previo };
          for (const [id, leidos] of resultados) {
            if (leidos !== null) siguiente[id] = leidos;
          }
          return siguiente;
        });
      });
    };
    traer();
    const pararSondeo = iniciarSondeo(traer, CADA_MS);
    return () => {
      vigente = false;
      pararSondeo();
    };
  }, [clave]);

  const boletos = useMemo(() => Object.values(porViaje).flat(), [porViaje]);
  return { boletos, fallo };
}
