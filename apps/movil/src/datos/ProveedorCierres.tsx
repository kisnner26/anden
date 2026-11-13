import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  crearCierresLocal,
  type CierreViaje,
  type ServicioCierres,
} from '@/servicios/cierres';
import { obtenerCliente } from '@/servicios/supabase/cliente';
import { crearCierresSupabase } from '@/servicios/supabase/cierresSupabase';

import { useSesion } from './useSesion';
import { ContextoCierres } from './useCierres';

let servicioElegido: ServicioCierres | null = null;

/** con Supabase configurado los cierres viajan al servidor; sin él se guardan en el teléfono */
function servicioPredeterminado(): ServicioCierres {
  if (!servicioElegido) {
    const cliente = obtenerCliente();
    servicioElegido = cliente
      ? crearCierresSupabase(cliente)
      : crearCierresLocal();
  }
  return servicioElegido;
}

/** comparte los viajes que el conductor ya cerró */
export function ProveedorCierres({
  children,
  servicio = servicioPredeterminado(),
}: {
  children: ReactNode;
  servicio?: ServicioCierres;
}) {
  const { sesion } = useSesion();
  const [cierres, establecerCierres] = useState<readonly CierreViaje[]>([]);

  useEffect(() => {
    let vigente = true;
    void servicio.leer().then((guardados) => {
      if (vigente) establecerCierres(guardados);
    });
    return () => {
      vigente = false;
    };
  }, [servicio, sesion]);

  const cerrar = useCallback(
    async (cierre: CierreViaje) => {
      establecerCierres(await servicio.guardar(cierre));
    },
    [servicio],
  );

  const valor = useMemo(
    () => ({
      cerrar,
      cierreDe: (viajeId: string) =>
        cierres.find((cierre) => cierre.viajeId === viajeId),
      cierres,
    }),
    [cerrar, cierres],
  );

  return (
    <ContextoCierres.Provider value={valor}>
      {children}
    </ContextoCierres.Provider>
  );
}
