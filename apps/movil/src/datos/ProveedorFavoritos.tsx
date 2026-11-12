import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { alternarFavorito, guardarFavoritos, leerFavoritos } from './favoritos';
import { ContextoFavoritos } from './useFavoritos';

/** comparte con la app los corredores que la persona marcó como favoritos */
export function ProveedorFavoritos({ children }: { children: ReactNode }) {
  const [favoritos, establecerFavoritos] = useState<readonly string[]>([]);

  useEffect(() => {
    let vigente = true;
    void leerFavoritos().then((guardados) => {
      if (vigente) establecerFavoritos(guardados);
    });
    return () => {
      vigente = false;
    };
  }, []);

  const alternar = useCallback(
    async (id: string) => {
      const nuevos = alternarFavorito(favoritos, id);
      establecerFavoritos(nuevos);
      await guardarFavoritos(nuevos);
    },
    [favoritos],
  );

  const valor = useMemo(
    () => ({
      alternar,
      esFavorito: (id: string) => favoritos.includes(id),
      favoritos,
    }),
    [alternar, favoritos],
  );

  return (
    <ContextoFavoritos.Provider value={valor}>
      {children}
    </ContextoFavoritos.Provider>
  );
}
