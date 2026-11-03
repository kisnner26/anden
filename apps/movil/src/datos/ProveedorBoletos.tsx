import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Ocupacion } from '@anden/dominio';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { crearReserva, ocupacionesDe, type BoletoGuardado } from './reserva';
import { ContextoBoletos, type ValorBoletos } from './useBoletos';
import { obtenerMuestra } from './useSalidas';

export const CLAVE_BOLETOS = 'anden.boletos';

function leerGuardados(texto: string | null): BoletoGuardado[] {
  if (!texto) return [];
  try {
    const valor: unknown = JSON.parse(texto);
    return Array.isArray(valor) ? (valor as BoletoGuardado[]) : [];
  } catch {
    return [];
  }
}

function mismoBoleto(a: Ocupacion, b: Ocupacion): boolean {
  return (
    a.estado === 'vendido' &&
    b.estado === 'vendido' &&
    a.boletoId === b.boletoId
  );
}

/** los asientos de los boletos guardados vuelven a quedar tomados en la muestra de esta sesión */
function ocuparEnMuestra(boletos: readonly BoletoGuardado[]): void {
  const muestra = obtenerMuestra();
  const nuevas = ocupacionesDe(boletos).filter(
    (ocupacion) =>
      !muestra.ocupaciones.some((existente) =>
        mismoBoleto(existente, ocupacion),
      ),
  );
  muestra.ocupaciones.push(...nuevas);
}

/** guarda los boletos en el teléfono para verlos sin conexión y los comparte con toda la app */
export function ProveedorBoletos({ children }: { children: ReactNode }) {
  const [boletos, establecerBoletos] = useState<BoletoGuardado[]>([]);
  const [cargando, establecerCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    AsyncStorage.getItem(CLAVE_BOLETOS)
      .then((texto) => {
        if (!activo) return;
        const guardados = leerGuardados(texto);
        ocuparEnMuestra(guardados);
        establecerBoletos(guardados);
      })
      .catch(() => undefined)
      .finally(() => {
        if (activo) establecerCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const guardar = useCallback(async (nuevos: BoletoGuardado[]) => {
    establecerBoletos(nuevos);
    await AsyncStorage.setItem(CLAVE_BOLETOS, JSON.stringify(nuevos));
  }, []);

  const reservar = useCallback<ValorBoletos['reservar']>(
    async (viajeId, pasajeros) => {
      const resultado = crearReserva(
        obtenerMuestra(),
        viajeId,
        pasajeros,
        new Date(),
        Math.random,
      );
      if (resultado.ok) {
        ocuparEnMuestra(resultado.valor);
        await guardar([...boletos, ...resultado.valor]);
      }
      return resultado;
    },
    [boletos, guardar],
  );

  const cancelar = useCallback(
    async (boletoId: string) => {
      const muestra = obtenerMuestra();
      muestra.ocupaciones = muestra.ocupaciones.filter(
        (ocupacion) =>
          !(ocupacion.estado === 'vendido' && ocupacion.boletoId === boletoId),
      );
      await guardar(
        boletos.map((guardado) =>
          guardado.boleto.id === boletoId
            ? {
                ...guardado,
                boleto: { ...guardado.boleto, estado: 'cancelado' },
              }
            : guardado,
        ),
      );
    },
    [boletos, guardar],
  );

  const valor = useMemo(
    () => ({ boletos, cancelar, cargando, reservar }),
    [boletos, cancelar, cargando, reservar],
  );

  return (
    <ContextoBoletos.Provider value={valor}>
      {children}
    </ContextoBoletos.Provider>
  );
}
