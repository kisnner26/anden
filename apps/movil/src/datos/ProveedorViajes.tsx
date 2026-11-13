import { useEffect, type ReactNode } from 'react';

import { sincronizarViajes } from './sincronizarViajes';
import { useSesion } from './useSesion';

const CADA_MS = 8000;

/** mantiene al día los viajes que publican los conductores mientras hay una cuenta abierta */
export function ProveedorViajes({ children }: { children: ReactNode }) {
  const { sesion } = useSesion();
  const hayCuenta = sesion !== null;

  useEffect(() => {
    if (!hayCuenta) return;
    void sincronizarViajes();
    const temporizador = setInterval(() => void sincronizarViajes(), CADA_MS);
    return () => clearInterval(temporizador);
  }, [hayCuenta]);

  return children;
}
