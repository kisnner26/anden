import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  conHabitual,
  guardarHabituales,
  leerHabituales,
  sinHabitual,
  type Habitual,
} from './habituales';
import { ContextoHabituales } from './useHabituales';

/** comparte los viajes que la persona hace seguido */
export function ProveedorHabituales({ children }: { children: ReactNode }) {
  const [habituales, establecerHabituales] = useState<readonly Habitual[]>([]);

  useEffect(() => {
    let vigente = true;
    void leerHabituales().then((guardados) => {
      if (vigente) establecerHabituales(guardados);
    });
    return () => {
      vigente = false;
    };
  }, []);

  const agregar = useCallback(
    async (nuevo: Habitual) => {
      const lista = conHabitual(habituales, nuevo);
      establecerHabituales(lista);
      await guardarHabituales(lista);
    },
    [habituales],
  );

  const quitar = useCallback(
    async (id: string | readonly string[]) => {
      const lista = sinHabitual(habituales, id);
      establecerHabituales(lista);
      await guardarHabituales(lista);
    },
    [habituales],
  );

  const valor = useMemo(
    () => ({ agregar, habituales, quitar }),
    [agregar, habituales, quitar],
  );

  return (
    <ContextoHabituales.Provider value={valor}>
      {children}
    </ContextoHabituales.Provider>
  );
}
