import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { supabase } from './supabase';
import type { Datos } from './tipos';

const CONSULTAS = {
  alertas: [
    'alertas',
    'id, viaje_id, tipo, lat, lng, nombre, atendida, creada_en',
  ],
  boletos: [
    'boletos',
    'boleto_id, viaje_id, asiento, estado, contenido, actualizado_en',
  ],
  choferes: ['perfiles_chofer', 'chofer_id, nombre, foto_url'],
  cierres: [
    'cierres',
    'viaje_id, chofer_id, cobrado, pasajeros, pendiente, cerrado_en',
  ],
  encomiendas: [
    'encomiendas',
    'id, chofer_id, estado, motivo, contenido, creada_en, actualizada_en',
  ],
  pagos: ['pagos', 'boleto_id, estado'],
  perfiles: ['perfiles', 'id, nombre, usuario, chofer_id, rol, creado_en'],
  solicitudes: [
    'solicitudes_conductor',
    'usuario_id, nombre, apellido, telefono, cedula, foto_frente, foto_dorso, estado, creada_en',
  ],
  transmisiones: ['transmisiones', 'viaje_id, lat, lng'],
  viajes: [
    'viajes',
    'id, chofer_id, ruta_id, servicio, placa, punto_encuentro, salida, estado, salio_en',
  ],
} as const;

const VACIO: Datos = {
  alertas: [],
  boletos: [],
  cargando: true,
  choferes: [],
  cierres: [],
  encomiendas: [],
  pagos: [],
  perfiles: [],
  recargar: async () => undefined,
  solicitudes: [],
  transmisiones: [],
  viajes: [],
};

const Contexto = createContext<Datos>(VACIO);

/** trae todo lo que el panel necesita una sola vez y lo renueva cada 6 segundos para todas las secciones */
export function ProveedorDatos({ children }: { children: ReactNode }) {
  const [datos, establecerDatos] = useState<Omit<Datos, 'recargar'>>(VACIO);

  const recargar = useCallback(async () => {
    if (!supabase) return;
    const claves = Object.keys(CONSULTAS) as (keyof typeof CONSULTAS)[];
    const respuestas = await Promise.all(
      claves.map(async (clave) => {
        const [tabla, columnas] = CONSULTAS[clave];
        const { data, error } = await supabase!
          .from(tabla)
          .select(columnas)
          .limit(1000);
        return [clave, error ? null : (data as unknown[])] as const;
      }),
    );
    establecerDatos((previo) => {
      const siguiente = { ...previo, cargando: false } as Record<
        string,
        unknown
      >;
      // si una tabla falló se conserva lo último que se vio
      for (const [clave, filas] of respuestas)
        if (filas) siguiente[clave] = filas;
      return siguiente as unknown as Omit<Datos, 'recargar'>;
    });
  }, []);

  useEffect(() => {
    void recargar();
    const t = setInterval(() => void recargar(), 6000);
    return () => clearInterval(t);
  }, [recargar]);

  const valor = useMemo(() => ({ ...datos, recargar }), [datos, recargar]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useDatos(): Datos {
  return useContext(Contexto);
}
