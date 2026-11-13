import { usePathname, useRootNavigationState, useRouter } from 'expo-router';
import { useEffect } from 'react';

import { useSesion } from './useSesion';

/** las únicas pantallas que se ven sin cuenta: la portada, ingresar y los registros */
export const RUTAS_PUBLICAS: readonly string[] = [
  '/',
  '/ingresar',
  '/cuenta',
  '/registro-conductor',
];

export function esRutaPublica(ruta: string): boolean {
  return RUTAS_PUBLICAS.includes(ruta);
}

/** sin cuenta registrada no se entra a la app: cualquier otra pantalla manda al ingreso */
export function GuardiaDeSesion() {
  const { cargando, sesion } = useSesion();
  const ruta = usePathname();
  const router = useRouter();
  const listo = useRootNavigationState()?.key !== undefined;

  useEffect(() => {
    if (!listo || cargando || sesion || esRutaPublica(ruta)) return;
    router.replace('/ingresar');
  }, [cargando, listo, ruta, router, sesion]);

  return null;
}
