import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { guardarMascotaActiva, leerMascotaActiva } from './mascota';
import { ContextoMascota } from './useMascota';

/** comparte con la app si la mascota de bienvenida está encendida */
export function ProveedorMascota({ children }: { children: ReactNode }) {
  const [activa, establecerActivaLocal] = useState(true);

  useEffect(() => {
    let vigente = true;
    void leerMascotaActiva().then((valor) => {
      if (vigente) establecerActivaLocal(valor);
    });
    return () => {
      vigente = false;
    };
  }, []);

  const establecerActiva = useCallback(async (nueva: boolean) => {
    establecerActivaLocal(nueva);
    await guardarMascotaActiva(nueva);
  }, []);

  const valor = useMemo(
    () => ({ activa, establecerActiva }),
    [activa, establecerActiva],
  );

  return (
    <ContextoMascota.Provider value={valor}>
      {children}
    </ContextoMascota.Provider>
  );
}
