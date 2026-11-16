import { useEffect, useState } from 'react';

import {
  leerAvisosDelViaje,
  type AvisoDelViaje,
} from '@/servicios/supabase/comunicacionSupabase';
import { iniciarSondeo } from './sondeo';

const CADA_MS = 15000;

/** el aviso más reciente que mandó el chofer de un viaje, renovado cada pocos segundos; nulo si no hay o no respondió */
export function useAvisoDelViaje(viajeId: string | null): AvisoDelViaje | null {
  const [aviso, establecerAviso] = useState<AvisoDelViaje | null>(null);

  useEffect(() => {
    if (!viajeId) return;
    let vigente = true;
    const traer = () => {
      void leerAvisosDelViaje(viajeId).then((lista) => {
        // si falla una vez se conserva lo último que se vio
        if (vigente && lista) establecerAviso(lista[0] ?? null);
      });
    };
    traer();
    const pararSondeo = iniciarSondeo(traer, CADA_MS);
    return () => {
      vigente = false;
      pararSondeo();
    };
  }, [viajeId]);

  return aviso;
}
