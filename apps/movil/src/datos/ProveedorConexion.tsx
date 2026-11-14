import * as Network from 'expo-network';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  obtenerUltimaSincronizacion,
  sincronizarViajes,
} from './sincronizarViajes';
import { ContextoConexion, type ValorConexion } from './useConexion';

/** cuánto dura el aviso de "volvió la señal" */
export const DURACION_AVISO_VUELTA_MS = 3000;

function hayInternet(estado: Network.NetworkState): boolean {
  if (estado.isInternetReachable !== undefined)
    return estado.isInternetReachable;
  return estado.isConnected ?? true;
}

/**
 * sabe si hay internet. Al perderlo la app sigue con lo guardado; al volver, se ponen al día las salidas
 * solas y se avisa un momento
 */
export function ProveedorConexion({ children }: { children: ReactNode }) {
  const [enLinea, establecerEnLinea] = useState(true);
  const [recienVuelta, establecerRecienVuelta] = useState(false);
  const [sincronizada, establecerSincronizada] = useState<Date | null>(
    obtenerUltimaSincronizacion(),
  );
  const estabaEnLinea = useRef(true);

  useEffect(() => {
    let vigente = true;
    let temporizador: ReturnType<typeof setTimeout> | undefined;

    function aplicar(nuevo: boolean) {
      if (!vigente) return;
      const volvio = nuevo && !estabaEnLinea.current;
      estabaEnLinea.current = nuevo;
      establecerEnLinea(nuevo);
      if (volvio) {
        establecerRecienVuelta(true);
        clearTimeout(temporizador);
        temporizador = setTimeout(
          () => establecerRecienVuelta(false),
          DURACION_AVISO_VUELTA_MS,
        );
        // al volver la señal se ponen al día las salidas sin que la persona haga nada
        void sincronizarViajes().then(() =>
          establecerSincronizada(obtenerUltimaSincronizacion()),
        );
      }
    }

    void Network.getNetworkStateAsync()
      .then((estado) => aplicar(hayInternet(estado)))
      .catch(() => undefined);
    const suscripcion = Network.addNetworkStateListener((estado) =>
      aplicar(hayInternet(estado)),
    );
    return () => {
      vigente = false;
      clearTimeout(temporizador);
      suscripcion.remove();
    };
  }, []);

  // la hora de la última sincronización se relee mientras no haya señal, por si llegó lo guardado
  useEffect(() => {
    const revisar = setInterval(
      () => establecerSincronizada(obtenerUltimaSincronizacion()),
      15_000,
    );
    return () => clearInterval(revisar);
  }, []);

  const valor = useMemo<ValorConexion>(
    () => ({
      enLinea,
      recienVuelta,
      ultimaSincronizacion: sincronizada ?? obtenerUltimaSincronizacion(),
    }),
    [enLinea, recienVuelta, sincronizada],
  );

  return (
    <ContextoConexion.Provider value={valor}>
      {children}
    </ContextoConexion.Provider>
  );
}
