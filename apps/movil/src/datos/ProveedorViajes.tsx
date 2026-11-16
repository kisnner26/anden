import { useEffect, type ReactNode } from 'react';

import { cargarViajesGuardados, sincronizarViajes } from './sincronizarViajes';
import { useSesion } from './useSesion';
import { iniciarSondeo } from './sondeo';

const CADA_MS = 8000;

/** mantiene al día los viajes que publican los conductores mientras hay una cuenta abierta */
export function ProveedorViajes({ children }: { children: ReactNode }) {
  const { sesion } = useSesion();
  const hayCuenta = sesion !== null;

  useEffect(() => {
    if (!hayCuenta) return;
    // primero lo guardado, para que haya salidas aunque no haya señal; después lo que diga el servidor
    void cargarViajesGuardados().then(() => sincronizarViajes());
    const pararSondeo = iniciarSondeo(() => void sincronizarViajes(), CADA_MS);
    return pararSondeo;
  }, [hayCuenta]);

  return children;
}
