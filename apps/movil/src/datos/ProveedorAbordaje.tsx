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

import { ContextoAbordaje, type ValorAbordaje } from './useAbordaje';

const SERVICIO_LOCAL = crearAbordajeLocal();

/** comparte con la app qué pasajeros ya subieron al bus; el cambio se ve al instante */
export function ProveedorAbordaje({
  children,
  servicio = SERVICIO_LOCAL,
}: {
  children: ReactNode;
  servicio?: ServicioAbordaje;
}) {
  const [registro, establecerRegistro] = useState<RegistroAbordaje>({});

  useEffect(() => {
    let vigente = true;
    void servicio.leer().then((leido) => {
      if (vigente) establecerRegistro(leido);
    });
    return () => {
      vigente = false;
    };
  }, [servicio]);

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
