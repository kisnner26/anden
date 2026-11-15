import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { leerEstadoDeBoletos } from '@/servicios/supabase/estadoBoletosSupabase';

import { ContextoEstadoRemotoBoletos } from './useEstadoRemotoBoletos';
import { useBoletos } from './useBoletos';
import { useSesion } from './useSesion';

const CADA_MS = 8000;

/**
 * mantiene al día, mientras hay cuenta, lo que el conductor va marcando de los boletos vigentes: cuando sube el
 * pasajero el boleto pasa a usado en su teléfono y cuando cobra se ve como pagado
 */
export function ProveedorEstadoBoletos({ children }: { children: ReactNode }) {
  const { sesion } = useSesion();
  const { boletos, validar } = useBoletos();
  const [abordados, establecerAbordados] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [pagados, establecerPagados] = useState<ReadonlySet<string>>(new Set());
  const yaValidados = useRef(new Set<string>());
  const validarRef = useRef(validar);
  validarRef.current = validar;

  const clave = boletos
    .filter(({ boleto }) => boleto.estado === 'vigente')
    .map(({ boleto }) => boleto.id)
    .join('|');
  const hayCuenta = sesion !== null;

  useEffect(() => {
    if (!hayCuenta || clave === '') return;
    const ids = clave.split('|');
    let vigente = true;
    const traer = () => {
      void leerEstadoDeBoletos(ids).then((estado) => {
        if (!vigente || estado === null) return;
        establecerAbordados(new Set(estado.abordados));
        establecerPagados(new Set(estado.pagados));
        for (const id of estado.abordados) {
          if (yaValidados.current.has(id)) continue;
          yaValidados.current.add(id);
          void validarRef.current(id);
        }
      });
    };
    traer();
    const temporizador = setInterval(traer, CADA_MS);
    return () => {
      vigente = false;
      clearInterval(temporizador);
    };
  }, [clave, hayCuenta]);

  const valor = useMemo(() => ({ abordados, pagados }), [abordados, pagados]);
  return (
    <ContextoEstadoRemotoBoletos.Provider value={valor}>
      {children}
    </ContextoEstadoRemotoBoletos.Provider>
  );
}
