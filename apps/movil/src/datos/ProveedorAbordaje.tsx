import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  abordo,
  crearAbordajeLocal,
  type RegistroAbordaje,
  type ServicioAbordaje,
} from '@/servicios/abordaje';

import { obtenerCliente } from '@/servicios/supabase/cliente';
import { crearAbordajeSupabase } from '@/servicios/supabase/abordajeSupabase';

import { useSesion } from './useSesion';
import { ContextoAbordaje, type ValorAbordaje } from './useAbordaje';

const SERVICIO_LOCAL = crearAbordajeLocal();

let servicioElegido: ServicioAbordaje | null = null;

/** con Supabase configurado el abordaje viaja al servidor; sin él se guarda en el teléfono */
function servicioPredeterminado(): ServicioAbordaje {
  if (!servicioElegido) {
    const cliente = obtenerCliente();
    servicioElegido = cliente
      ? crearAbordajeSupabase(cliente, async () => {
          const { data } = await cliente.auth.getUser();
          if (!data.user) return null;
          const perfil = await cliente
            .from('perfiles')
            .select('chofer_id')
            .eq('id', data.user.id)
            .maybeSingle<{ chofer_id: string | null }>();
          return perfil.data?.chofer_id ?? null;
        })
      : SERVICIO_LOCAL;
  }
  return servicioElegido;
}

/** comparte con la app qué pasajeros ya subieron al bus; el cambio se ve al instante */
export function ProveedorAbordaje({
  children,
  servicio = servicioPredeterminado(),
}: {
  children: ReactNode;
  servicio?: ServicioAbordaje;
}) {
  const { sesion } = useSesion();
  const [registro, establecerRegistro] = useState<RegistroAbordaje>({});

  useEffect(() => {
    let vigente = true;
    void servicio.leer().then((leido) => {
      if (vigente) establecerRegistro(leido);
    });
    return () => {
      vigente = false;
    };
    // al cambiar de cuenta se vuelve a leer lo que el servidor deja ver
  }, [servicio, sesion]);

  const alternar = useCallback(
    async (boletoId: string) => {
      // primero se refleja en pantalla y después se guarda
      establecerRegistro((actual) => {
        const siguiente = { ...actual };
        if (siguiente[boletoId] !== undefined) delete siguiente[boletoId];
        else siguiente[boletoId] = new Date().toISOString();
        return siguiente;
      });
      establecerRegistro(await servicio.alternar(boletoId));
    },
    [servicio],
  );

  const valor = useMemo<ValorAbordaje>(
    () => ({
      abordo: (boletoId) => abordo(registro, boletoId),
      alternar,
      registro,
    }),
    [alternar, registro],
  );

  return (
    <ContextoAbordaje.Provider value={valor}>
      {children}
    </ContextoAbordaje.Provider>
  );
}
