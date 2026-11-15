import { useEffect, useState } from 'react';

import { boletoPorCalificar } from './calificarViaje';
import { leerOpiniones } from './opiniones';
import type { BoletoGuardado } from './reserva';
import { useBoletos } from './useBoletos';
import { useAhora, useSalidas } from './useSalidas';

/** el viaje ya hecho más reciente al que todavía no se le dejó opinión, o nulo */
export function useBoletoPorCalificar(): BoletoGuardado | null {
  const { boletos } = useBoletos();
  const ahora = useAhora();
  const { salidas } = useSalidas();
  const [calificados, establecerCalificados] = useState<
    Awaited<ReturnType<typeof leerOpiniones>>
  >([]);

  useEffect(() => {
    void leerOpiniones().then(establecerCalificados);
  }, [boletos.length]);

  const llegados = new Set(
    salidas.filter((s) => s.estado === 'llego').map((s) => s.viajeId),
  );
  return boletoPorCalificar(boletos, calificados, ahora, llegados);
}
