import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  crearPagosLocal,
  estadoDePago,
  type RegistroPagos,
  type ServicioPagos,
} from '@/servicios/pagos';

import { ContextoPagos, type ValorPagos } from './usePagos';

const SERVICIO_LOCAL = crearPagosLocal();

/** comparte con la app qué boletos ya se pagaron en efectivo */
export function ProveedorPagos({
  children,
  servicio = SERVICIO_LOCAL,
}: {
  children: ReactNode;
  servicio?: ServicioPagos;
}) {
  const [registro, establecerRegistro] = useState<RegistroPagos>({});

  useEffect(() => {
    let vigente = true;
    void servicio.leer().then((leido) => {
      if (vigente) establecerRegistro(leido);
    });
    return () => {
      vigente = false;
    };
  }, [servicio]);

  const marcarPagado = useCallback(
    async (boletoId: string, choferId: string) => {
      establecerRegistro(await servicio.marcarPagado(boletoId, choferId));
    },
    [servicio],
  );

  const revertir = useCallback(
    async (boletoId: string) => {
      establecerRegistro(await servicio.revertir(boletoId));
    },
    [servicio],
  );

  const valor = useMemo<ValorPagos>(
    () => ({
      estadoDe: (boletoId) => estadoDePago(registro, boletoId),
      marcarPagado,
      registro,
      revertir,
    }),
    [marcarPagado, registro, revertir],
  );

  return (
    <ContextoPagos.Provider value={valor}>{children}</ContextoPagos.Provider>
  );
}
