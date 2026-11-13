import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  guardarBusPropio,
  leerBusPropio,
  type EleccionUnidad,
} from '@/servicios/busPropio';

import { claveDeCuenta } from '@/servicios/sesion';

import { useSesion } from './useSesion';
import { ContextoBusPropio } from './useBusPropio';
import { useSuscripcion } from './useSuscripcion';

/** comparte el bus que la persona eligió; solo se aplica con Plus, pero la elección se recuerda */
export function ProveedorBusPropio({ children }: { children: ReactNode }) {
  const { plus } = useSuscripcion();
  const { sesion } = useSesion();
  const cuenta = claveDeCuenta(sesion);
  const [elegido, establecerElegido] = useState<EleccionUnidad | null>(null);

  useEffect(() => {
    let vigente = true;
    establecerElegido(null);
    void leerBusPropio(cuenta).then((guardado) => {
      if (vigente) establecerElegido(guardado);
    });
    return () => {
      vigente = false;
    };
  }, [cuenta]);

  const elegir = useCallback(
    async (variante: EleccionUnidad | null) => {
      establecerElegido(variante);
      await guardarBusPropio(variante, cuenta);
    },
    [cuenta],
  );

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
