import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  crearSuscripcionLocal,
  ESTADO_GRATIS,
  esPlus,
  type EstadoSuscripcion,
  type ServicioSuscripcion,
} from '@/servicios/suscripcion';

import { ContextoSuscripcion } from './useSuscripcion';

const SERVICIO_LOCAL = crearSuscripcionLocal();

/** comparte si la persona tiene Andén Plus */
export function ProveedorSuscripcion({
  children,
  servicio = SERVICIO_LOCAL,
}: {
  children: ReactNode;
  servicio?: ServicioSuscripcion;
}) {
  const [estado, establecerEstado] = useState<EstadoSuscripcion>(ESTADO_GRATIS);

  useEffect(() => {
    let vigente = true;
    void servicio.leer().then((leido) => {
      if (vigente) establecerEstado(leido);
    });
    return () => {
      vigente = false;
    };
  }, [servicio]);

  const activar = useCallback(async () => {
    establecerEstado(await servicio.activar());
  }, [servicio]);

  const cancelar = useCallback(async () => {
    establecerEstado(await servicio.cancelar());
  }, [servicio]);

  const valor = useMemo(
    () => ({ activar, cancelar, estado, plus: esPlus(estado) }),
    [activar, cancelar, estado],
  );

  return (
    <ContextoSuscripcion.Provider value={valor}>
      {children}
    </ContextoSuscripcion.Provider>
  );
}
