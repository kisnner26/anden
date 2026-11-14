import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  guardarConsejosVistos,
  guardarMascotaActiva,
  leerConsejosVistos,
  leerMascotaActiva,
  marcarVisto,
  type ConsejosVistos,
} from './mascota';
import { ContextoMascota } from './useMascota';

/** recuerda si la persona activó a Rumbo y qué consejos ya le mostró hoy */
export function ProveedorMascota({ children }: { children: ReactNode }) {
  const [activa, establecerActiva] = useState(false);
  const [vistos, establecerVistos] = useState<ConsejosVistos>({});

  useEffect(() => {
    let vigente = true;
    void Promise.all([leerMascotaActiva(), leerConsejosVistos()]).then(
      ([encendida, guardados]) => {
        if (!vigente) return;
        establecerActiva(encendida);
        establecerVistos(guardados);
      },
    );
    return () => {
      vigente = false;
    };
  }, []);

  const cambiar = useCallback(async (valor: boolean) => {
    establecerActiva(valor);
    await guardarMascotaActiva(valor);
  }, []);

  const marcar = useCallback((id: string) => {
    establecerVistos((previos) => {
      const siguientes = marcarVisto(previos, id, new Date());
      void guardarConsejosVistos(siguientes);
      return siguientes;
    });
  }, []);

  const valor = useMemo(
    () => ({ activa, cambiar, marcar, vistos }),
    [activa, cambiar, marcar, vistos],
  );
  return (
    <ContextoMascota.Provider value={valor}>
      {children}
    </ContextoMascota.Provider>
  );
}
