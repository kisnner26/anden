import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { IdVarianteBus } from '@/componentes/Autobus';
import { guardarBusPropio, leerBusPropio } from '@/servicios/busPropio';

import { ContextoBusPropio } from './useBusPropio';
import { useSuscripcion } from './useSuscripcion';

/** comparte el bus que la persona eligió; solo se aplica con Plus, pero la elección se recuerda */
export function ProveedorBusPropio({ children }: { children: ReactNode }) {
  const { plus } = useSuscripcion();
  const [elegido, establecerElegido] = useState<IdVarianteBus | null>(null);

  useEffect(() => {
    let vigente = true;
    void leerBusPropio().then((guardado) => {
      if (vigente) establecerElegido(guardado);
    });
    return () => {
      vigente = false;
    };
  }, []);

  const elegir = useCallback(async (variante: IdVarianteBus | null) => {
    establecerElegido(variante);
    await guardarBusPropio(variante);
  }, []);

  const valor = useMemo(
    () => ({ efectivo: plus ? elegido : null, elegido, elegir }),
    [elegido, elegir, plus],
  );

  return (
    <ContextoBusPropio.Provider value={valor}>
      {children}
    </ContextoBusPropio.Provider>
  );
}
