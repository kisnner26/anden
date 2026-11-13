import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  servicioDeEncomiendas,
  type ServicioEncomiendas,
} from '@/servicios/servicioEncomiendas';

import {
  conEstado,
  nuevaEncomienda,
  type DatosEncomienda,
  type Encomienda,
  type EstadoEncomienda,
} from './encomiendas';
import { ContextoEncomiendas, type ValorEncomiendas } from './useEncomiendas';
import { useSesion } from './useSesion';

const CADA_MS = 8000;

/**
 * mantiene al día las encomiendas: las que envía esta persona y, si es chofer, las de sus viajes.
 * Se renuevan solas cada pocos segundos para que el estado llegue a los dos lados.
 */
export function ProveedorEncomiendas({
  children,
  servicio: servicioFijo,
}: {
  children: ReactNode;
  servicio?: ServicioEncomiendas;
}) {
  const { sesion } = useSesion();
  const cuenta = sesion?.usuario ?? sesion?.choferId ?? sesion?.nombre ?? null;
  const [encomiendas, establecerEncomiendas] = useState<Encomienda[]>([]);
  const [cargando, establecerCargando] = useState(true);

  const servicio = useCallback(
    () => servicioFijo ?? servicioDeEncomiendas(),
    [servicioFijo],
  );

  const recargar = useCallback(async () => {
    const lista = await servicio().listar();
    // si el servidor no respondió se conserva lo último que se vio
    if (lista !== null) establecerEncomiendas(lista);
    establecerCargando(false);
  }, [servicio]);

  useEffect(() => {
    establecerEncomiendas([]);
    establecerCargando(true);
    void recargar();
    const temporizador = setInterval(() => void recargar(), CADA_MS);
    return () => clearInterval(temporizador);
  }, [cuenta, recargar]);

  const enviar = useCallback(
    async (datos: DatosEncomienda) => {
      const nueva = nuevaEncomienda(datos);
      if (!(await servicio().guardar(nueva))) return null;
      establecerEncomiendas((previas) => [nueva, ...previas]);
      return nueva;
    },
    [servicio],
  );

  const cambiarEstado = useCallback(
    async (id: string, estado: EstadoEncomienda, motivo?: string) => {
      const actual = encomiendas.find((encomienda) => encomienda.id === id);
      const cambiada = actual ? conEstado(actual, estado, motivo) : null;
      if (!cambiada) return false;
      if (!(await servicio().actualizar(cambiada))) return false;
      establecerEncomiendas((previas) =>
        previas.map((encomienda) =>
          encomienda.id === id ? cambiada : encomienda,
        ),
      );
      return true;
    },
    [encomiendas, servicio],
  );

  const valor = useMemo<ValorEncomiendas>(
    () => ({ cambiarEstado, cargando, encomiendas, enviar, recargar }),
    [cambiarEstado, cargando, encomiendas, enviar, recargar],
  );

  return (
    <ContextoEncomiendas.Provider value={valor}>
      {children}
    </ContextoEncomiendas.Provider>
  );
}
