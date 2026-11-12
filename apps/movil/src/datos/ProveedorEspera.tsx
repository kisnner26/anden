import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  conEspera,
  esperaDeSalida,
  guardarEsperas,
  leerEsperas,
  sinEspera,
  type Espera,
} from './espera';
import type { Salida } from './salidas';
import { ContextoEspera } from './useEspera';

/** las salidas llenas a las que la persona pidió que se le avise si se libera un asiento */
export function ProveedorEspera({ children }: { children: ReactNode }) {
  const [esperas, establecerEsperas] = useState<readonly Espera[]>([]);

  useEffect(() => {
    let vigente = true;
    void leerEsperas().then((guardadas) => {
      if (vigente) establecerEsperas(guardadas);
    });
    return () => {
      vigente = false;
    };
  }, []);

  const agregar = useCallback(
    async (salida: Salida) => {
      const lista = conEspera(esperas, esperaDeSalida(salida));
      establecerEsperas(lista);
      await guardarEsperas(lista);
    },
    [esperas],
  );

  const quitar = useCallback(
    async (viajeId: string) => {
      const lista = sinEspera(esperas, viajeId);
      establecerEsperas(lista);
      await guardarEsperas(lista);
    },
    [esperas],
  );

  const valor = useMemo(
    () => ({
      agregar,
      enEspera: (viajeId: string) =>
        esperas.some((espera) => espera.viajeId === viajeId),
      esperas,
      quitar,
    }),
    [agregar, esperas, quitar],
  );

  return (
    <ContextoEspera.Provider value={valor}>{children}</ContextoEspera.Provider>
  );
}
