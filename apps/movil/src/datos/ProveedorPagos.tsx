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

import { obtenerCliente } from '@/servicios/supabase/cliente';
import { crearPagosSupabase } from '@/servicios/supabase/pagosSupabase';

import { useSesion } from './useSesion';
import { ContextoPagos, type ValorPagos } from './usePagos';

const SERVICIO_LOCAL = crearPagosLocal();

let servicioElegido: ServicioPagos | null = null;

/** con Supabase configurado los pagos viajan al servidor; sin él se guardan en el teléfono */
function servicioPredeterminado(): ServicioPagos {
  if (!servicioElegido) {
    const cliente = obtenerCliente();
    servicioElegido = cliente ? crearPagosSupabase(cliente) : SERVICIO_LOCAL;
  }
  return servicioElegido;
}

/** comparte con la app qué boletos ya se pagaron en efectivo */
export function ProveedorPagos({
  children,
  servicio = servicioPredeterminado(),
}: {
  children: ReactNode;
  servicio?: ServicioPagos;
}) {
  const { sesion } = useSesion();
  const [registro, establecerRegistro] = useState<RegistroPagos>({});

  useEffect(() => {
    let vigente = true;
    void servicio.leer().then((leido) => {
      if (vigente) establecerRegistro(leido);
    });
    return () => {
      vigente = false;
    };
    // al cambiar de cuenta se vuelve a leer: cada rol ve lo que el servidor le permite
  }, [servicio, sesion]);

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
