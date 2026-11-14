import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Ocupacion } from '@anden/dominio';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { claveDeCuenta, type Sesion } from '@/servicios/sesion';
import { publicarBoletos } from '@/servicios/supabase/boletosCompartidos';

import { sincronizarAsientos } from './asientosRemotos';
import { crearReserva, ocupacionesDe, type BoletoGuardado } from './reserva';
import { useBusPropio } from './useBusPropio';
import { useSesion } from './useSesion';
import { useSuscripcion } from './useSuscripcion';
import { ContextoBoletos, type ValorBoletos } from './useBoletos';
import { obtenerMuestra } from './useSalidas';

export const CLAVE_BOLETOS = 'anden.boletos';

/** cada cuenta guarda sus boletos aparte; sin cuenta se usa la lista de siempre del teléfono */
export function claveBoletosDe(sesion: Sesion | null): string {
  const cuenta = claveDeCuenta(sesion);
  return cuenta ? `${CLAVE_BOLETOS}.${cuenta}` : CLAVE_BOLETOS;
}

function leerGuardados(texto: string | null): BoletoGuardado[] {
  if (!texto) return [];
  try {
    const valor: unknown = JSON.parse(texto);
    if (!Array.isArray(valor)) return [];
    // los boletos guardados antes de los Plus Codes traían un número de andén: quedan con el punto por confirmar
    return (valor as BoletoGuardado[]).map((guardado) =>
      typeof guardado.resumen?.puntoEncuentro === 'string'
        ? guardado
        : {
            ...guardado,
            resumen: { ...guardado.resumen, puntoEncuentro: '' },
          },
    );
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
  const { sesion } = useSesion();
  const { plus } = useSuscripcion();
  const { efectivo } = useBusPropio();
  const clave = claveBoletosDe(sesion);

  useEffect(() => {
    let activo = true;
    establecerCargando(true);
    // al cambiar de cuenta se muestran los boletos de esa cuenta y no los de la anterior
    establecerBoletos([]);
    AsyncStorage.getItem(clave)
      .then((texto) => {
        if (!activo) return;
        const guardados = leerGuardados(texto);
        ocuparEnMuestra(guardados);
        establecerBoletos(guardados);
        // los boletos que no llegaron al servidor (sin conexión, o hechos antes de entrar) se suben ahora
        if (sesion) void publicarBoletos(guardados).catch(() => undefined);
      })
      .catch(() => undefined)
      .finally(() => {
        if (activo) establecerCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [clave, sesion]);

  const guardar = useCallback(
    async (nuevos: BoletoGuardado[]) => {
      establecerBoletos(nuevos);
      await AsyncStorage.setItem(clave, JSON.stringify(nuevos));
      // copia para el conductor; si falla la red, el boleto sigue guardado y se sube la próxima vez
      void publicarBoletos(nuevos).catch(() => undefined);
    },
    [clave],
  );

  const reservar = useCallback<ValorBoletos['reservar']>(
    async (viajeId, pasajeros) => {
      // antes de vender se mira lo que ya vendieron los demás teléfonos
      await sincronizarAsientos(viajeId);
      const resultado = crearReserva(
        obtenerMuestra(),
        viajeId,
        pasajeros,
        new Date(),
        Math.random,
        { plus, unidad: efectivo },
      );
      if (!resultado.ok) return resultado;
      // el servidor es quien decide si el asiento sigue libre: si otro lo vendió justo antes, no se reserva
      const publicacion = await publicarBoletos(resultado.valor).catch(
        () => undefined,
      );
      if (publicacion && publicacion.conflictos.length > 0) {
        await sincronizarAsientos(viajeId);
        return { error: 'asiento-ocupado', ok: false };
      }
      ocuparEnMuestra(resultado.valor);
      await guardar([...boletos, ...resultado.valor]);
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

  const validar = useCallback(
    async (boletoId: string) => {
      await guardar(
        boletos.map((guardado) =>
          guardado.boleto.id === boletoId
            ? { ...guardado, boleto: { ...guardado.boleto, estado: 'usado' } }
            : guardado,
        ),
      );
    },
    [boletos, guardar],
  );

  const valor = useMemo(
    () => ({ boletos, cancelar, cargando, reservar, validar }),
    [boletos, cancelar, cargando, reservar, validar],
  );

  return (
    <ContextoBoletos.Provider value={valor}>
      {children}
    </ContextoBoletos.Provider>
  );
}
