import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  claveDeCuenta,
  nombreYApellido,
  type Sesion,
} from '@/servicios/sesion';

import { PERFIL_VACIO, leerPerfil, type Perfil } from './perfil';
import { useSesion } from './useSesion';
import { ContextoPerfil, type ValorPerfil } from './usePerfil';

export const CLAVE_PERFIL = 'anden.perfil';

/** cada cuenta guarda su perfil aparte; sin cuenta se usa el de siempre del teléfono */
export function clavePerfilDe(sesion: Sesion | null): string {
  const cuenta = claveDeCuenta(sesion);
  return cuenta ? `${CLAVE_PERFIL}.${cuenta}` : CLAVE_PERFIL;
}

/** lo que se sabe de una cuenta que todavía no llenó su perfil: su nombre */
function perfilInicial(sesion: Sesion | null): Perfil {
  return sesion
    ? { ...PERFIL_VACIO, ...nombreYApellido(sesion) }
    : PERFIL_VACIO;
}

/** guarda el perfil en el teléfono y lo comparte con toda la app */
export function ProveedorPerfil({ children }: { children: ReactNode }) {
  const { sesion } = useSesion();
  const clave = clavePerfilDe(sesion);
  const [perfil, establecerPerfil] = useState<Perfil>(() =>
    perfilInicial(sesion),
  );
  const [cargando, establecerCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    establecerCargando(true);
    // al cambiar de cuenta se carga el perfil de esa cuenta y no el de la anterior
    establecerPerfil(perfilInicial(sesion));
    AsyncStorage.getItem(clave)
      .then((texto) => {
        if (activo && texto) establecerPerfil(leerPerfil(texto));
      })
      .catch(() => undefined)
      .finally(() => {
        if (activo) establecerCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [clave, sesion]);

  const persistir = useCallback(
    async (nuevo: Perfil, cuenta: Sesion | null = sesion) => {
      establecerPerfil(nuevo);
      await AsyncStorage.setItem(clavePerfilDe(cuenta), JSON.stringify(nuevo));
    },
    [sesion],
  );

  const guardar = useCallback<ValorPerfil['guardar']>(
    (cambios, cuenta) => persistir({ ...perfil, ...cambios }, cuenta),
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
