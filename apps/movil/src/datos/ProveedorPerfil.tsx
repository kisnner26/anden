import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { PERFIL_VACIO, leerPerfil, type Perfil } from './perfil';
import { ContextoPerfil, type ValorPerfil } from './usePerfil';

export const CLAVE_PERFIL = 'anden.perfil';

/** guarda el perfil en el teléfono y lo comparte con toda la app */
export function ProveedorPerfil({ children }: { children: ReactNode }) {
  const [perfil, establecerPerfil] = useState<Perfil>(PERFIL_VACIO);
  const [cargando, establecerCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    AsyncStorage.getItem(CLAVE_PERFIL)
      .then((texto) => {
        if (activo) establecerPerfil(leerPerfil(texto));
      })
      .catch(() => undefined)
      .finally(() => {
        if (activo) establecerCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const persistir = useCallback(async (nuevo: Perfil) => {
    establecerPerfil(nuevo);
    await AsyncStorage.setItem(CLAVE_PERFIL, JSON.stringify(nuevo));
  }, []);

  const guardar = useCallback<ValorPerfil['guardar']>(
    (cambios) => persistir({ ...perfil, ...cambios }),
    [perfil, persistir],
  );

  const agregarPasajero = useCallback<ValorPerfil['agregarPasajero']>(
    (pasajero) =>
      persistir({
        ...perfil,
        pasajeros: [
          ...perfil.pasajeros,
          { ...pasajero, id: `pas_${Date.now().toString(36)}` },
        ],
      }),
    [perfil, persistir],
  );

  const quitarPasajero = useCallback<ValorPerfil['quitarPasajero']>(
    (id) =>
      persistir({
        ...perfil,
        pasajeros: perfil.pasajeros.filter((pasajero) => pasajero.id !== id),
      }),
    [perfil, persistir],
  );

  const valor = useMemo(
    () => ({ agregarPasajero, cargando, guardar, perfil, quitarPasajero }),
    [agregarPasajero, cargando, guardar, perfil, quitarPasajero],
  );

  return (
    <ContextoPerfil.Provider value={valor}>{children}</ContextoPerfil.Provider>
  );
}
