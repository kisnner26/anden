import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import {
  guardarUbicacionAutomatica,
  leerUbicacionAutomatica,
} from './preferenciaUbicacion';
import {
  consultarAccesoUbicacion,
  solicitarAccesoUbicacion,
  type EstadoAccesoUbicacion,
} from './ubicacion';

export type EstadoPreferenciaUbicacion =
  EstadoAccesoUbicacion['estado'] | 'apagada' | 'cargando' | 'consultando';

interface ValorUbicacion {
  activada: boolean;
  activar: () => Promise<void>;
  desactivar: () => Promise<void>;
  estado: EstadoPreferenciaUbicacion;
  reintentar: () => Promise<void>;
}

const ContextoUbicacion = createContext<ValorUbicacion>({
  activada: false,
  activar: async () => undefined,
  desactivar: async () => undefined,
  estado: 'cargando',
  reintentar: async () => undefined,
});

function nombreEstado(resultado: EstadoAccesoUbicacion) {
  return resultado.estado;
}

export function ProveedorUbicacion({ children }: PropsWithChildren) {
  const [activada, establecerActivada] = useState(false);
  const [estado, establecerEstado] =
    useState<EstadoPreferenciaUbicacion>('cargando');

  useEffect(() => {
    leerUbicacionAutomatica()
      .then(async (guardada) => {
        establecerActivada(guardada);
        if (!guardada) {
          establecerEstado('apagada');
          return;
        }
        establecerEstado(nombreEstado(await consultarAccesoUbicacion()));
      })
      .catch(() => establecerEstado('error'));
  }, []);

  const pedirAcceso = useCallback(async () => {
    establecerEstado('consultando');
    establecerEstado(nombreEstado(await solicitarAccesoUbicacion()));
  }, []);

  const activar = useCallback(async () => {
    establecerActivada(true);
    await guardarUbicacionAutomatica(true);
    await pedirAcceso();
  }, [pedirAcceso]);

  const desactivar = useCallback(async () => {
    establecerActivada(false);
    establecerEstado('apagada');
    await guardarUbicacionAutomatica(false);
  }, []);

  const valor = useMemo(
    () => ({ activada, activar, desactivar, estado, reintentar: pedirAcceso }),
    [activada, activar, desactivar, estado, pedirAcceso],
  );

  return (
    <ContextoUbicacion.Provider value={valor}>
      {children}
    </ContextoUbicacion.Provider>
  );
}

export function usePreferenciaUbicacion() {
  return useContext(ContextoUbicacion);
}
