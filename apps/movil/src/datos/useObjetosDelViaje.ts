import { useCallback, useEffect, useState } from 'react';

import {
  leerObjetosDelViaje,
  reclamarObjeto,
  type ObjetoPerdido,
} from '@/servicios/supabase/objetosPerdidosSupabase';

const CADA_MS = 30000;

/** los objetos que el chofer reportó de un viaje, renovados cada medio minuto, y la forma de reclamar uno */
export function useObjetosDelViaje(viajeId: string | null): {
  objetos: ObjetoPerdido[];
  reclamar: (objetoId: string) => Promise<boolean>;
} {
  const [objetos, establecerObjetos] = useState<ObjetoPerdido[]>([]);

  const traer = useCallback(async () => {
    if (!viajeId) return;
    const lista = await leerObjetosDelViaje(viajeId);
    // si falla una vez se conserva lo último que se vio
    if (lista) establecerObjetos(lista);
  }, [viajeId]);

  useEffect(() => {
    void traer();
    const temporizador = setInterval(() => void traer(), CADA_MS);
    return () => clearInterval(temporizador);
  }, [traer]);

  const reclamar = useCallback(
    async (objetoId: string) => {
      const bien = await reclamarObjeto(objetoId);
      await traer();
      return bien;
    },
    [traer],
  );

  return { objetos, reclamar };
}
