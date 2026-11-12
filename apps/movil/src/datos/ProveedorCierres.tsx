import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  guardarCierre,
  leerCierres,
  type CierreViaje,
} from '@/servicios/cierres';

import { ContextoCierres } from './useCierres';

/** comparte los viajes que el conductor ya cerró */
export function ProveedorCierres({ children }: { children: ReactNode }) {
  const [cierres, establecerCierres] = useState<readonly CierreViaje[]>([]);

  useEffect(() => {
    let vigente = true;
    void leerCierres().then((guardados) => {
      if (vigente) establecerCierres(guardados);
    });
    return () => {
      vigente = false;
    };
  }, []);

  const cerrar = useCallback(async (cierre: CierreViaje) => {
    establecerCierres(await guardarCierre(cierre));
  }, []);

  const valor = useMemo(
    () => ({
      cerrar,
      cierreDe: (viajeId: string) =>
        cierres.find((cierre) => cierre.viajeId === viajeId),
      cierres,
    }),
    [cerrar, cierres],
  );

  return (
    <ContextoCierres.Provider value={valor}>
      {children}
    </ContextoCierres.Provider>
  );
}
