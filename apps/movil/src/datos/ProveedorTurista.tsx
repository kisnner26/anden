import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { guardarTurista, leerTurista } from '@/servicios/ajustesIA';

import { ContextoTurista } from './useTurista';

/** recuerda si la persona dijo que es turista; con eso la IA recomienda qué visitar en cada destino */
export function ProveedorTurista({ children }: { children: ReactNode }) {
  const [turista, establecerTurista] = useState(false);

  useEffect(() => {
    let vigente = true;
    void leerTurista().then((valor) => {
      if (vigente) establecerTurista(valor);
    });
    return () => {
      vigente = false;
    };
  }, []);

  const cambiar = useCallback(async (valor: boolean) => {
    establecerTurista(valor);
    await guardarTurista(valor);
  }, []);

  const valor = useMemo(() => ({ cambiar, turista }), [cambiar, turista]);
  return (
    <ContextoTurista.Provider value={valor}>
      {children}
    </ContextoTurista.Provider>
  );
}
