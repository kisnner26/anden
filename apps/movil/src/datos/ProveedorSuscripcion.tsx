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

import { claveDeCuenta } from '@/servicios/sesion';

import { useSesion } from './useSesion';
import { ContextoSuscripcion } from './useSuscripcion';

/** comparte si la persona tiene Andén Plus */
export function ProveedorSuscripcion({
  children,
  servicio: servicioFijo,
}: {
  children: ReactNode;
  servicio?: ServicioSuscripcion;
}) {
  const { sesion } = useSesion();
  const cuenta = claveDeCuenta(sesion);
  // cada cuenta tiene su propio plan: lo que activó el pasajero no lo hereda el conductor
  const servicio = useMemo(
    () => servicioFijo ?? crearSuscripcionLocal(cuenta),
    [cuenta, servicioFijo],
  );
  const [estado, establecerEstado] = useState<EstadoSuscripcion>(ESTADO_GRATIS);

  useEffect(() => {
    let vigente = true;
    establecerEstado(ESTADO_GRATIS);
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
