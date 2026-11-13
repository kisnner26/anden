import type { SupabaseClient } from '@supabase/supabase-js';

import {
  crearTransmisionLocal,
  type PosicionBus,
  type ServicioTransmision,
} from '../transmision';

interface FilaTransmision {
  chofer_id: string;
  lat: number | null;
  lng: number | null;
  registrada_en: string;
  velocidad_ms: number | null;
  viaje_id: string;
}

/** cada cuánto se pregunta al servidor mientras alguien mira los buses en camino */
export const CADA_MS = 4000;

/**
 * la transmisión compartida: el estado vive en un servicio local, que responde al instante, y se
 * sincroniza con la tabla `transmisiones`. Lo que publica este teléfono sube a la tabla; lo que
 * publican los demás conductores baja cada pocos segundos mientras alguien escucha.
 */
export function crearTransmisionSupabase(
  cliente: SupabaseClient,
  local: ServicioTransmision = crearTransmisionLocal(),
  cadaMs: number = CADA_MS,
): ServicioTransmision {
  /** viajes que transmite este teléfono, con su chofer */
  const propios = new Map<string, string>();
  /** viajes que aparecen por lo que dijo el servidor */
  const remotos = new Set<string>();
  let oyentes = 0;
  let temporizador: ReturnType<typeof setInterval> | null = null;
  let consultando = false;

  async function sincronizar() {
    if (consultando) return;
    consultando = true;
    try {
      const { data, error } = await cliente
        .from('transmisiones')
        .select('viaje_id, chofer_id, lat, lng, velocidad_ms, registrada_en');
      if (error || !data) return;
      const vistos = new Set<string>();
      for (const fila of data as FilaTransmision[]) {
        if (propios.has(fila.viaje_id)) continue;
        vistos.add(fila.viaje_id);
        if (!local.activos().includes(fila.viaje_id)) {
          local.iniciar(fila.viaje_id, fila.chofer_id);
        }
        remotos.add(fila.viaje_id);
        const actual = local.ultima(fila.viaje_id);
        if (
          fila.lat !== null &&
          fila.lng !== null &&
          actual?.registradaEn !== fila.registrada_en
        ) {
          local.publicar(fila.viaje_id, {
            lat: fila.lat,
            lng: fila.lng,
            registradaEn: fila.registrada_en,
            velocidadMs: fila.velocidad_ms,
          });
        }
      }
      for (const viajeId of [...remotos]) {
        if (!vistos.has(viajeId)) {
          remotos.delete(viajeId);
          local.detener(viajeId);
        }
      }
    } finally {
      consultando = false;
    }
  }

  return {
    activos: () => local.activos(),
    detener(viajeId) {
      propios.delete(viajeId);
      local.detener(viajeId);
      void cliente.from('transmisiones').delete().eq('viaje_id', viajeId);
    },
    instantanea: () => local.instantanea(),
    iniciar(viajeId, choferId) {
      propios.set(viajeId, choferId);
      remotos.delete(viajeId);
      local.iniciar(viajeId, choferId);
      void cliente.from('transmisiones').upsert(
        {
          chofer_id: choferId,
          lat: null,
          lng: null,
          registrada_en: new Date().toISOString(),
          velocidad_ms: null,
          viaje_id: viajeId,
        },
        { onConflict: 'viaje_id' },
      );
    },
    publicar(viajeId: string, posicion: PosicionBus) {
      local.publicar(viajeId, posicion);
      const chofer = propios.get(viajeId);
      if (!chofer) return;
      void cliente.from('transmisiones').upsert(
        {
          chofer_id: chofer,
          lat: posicion.lat,
          lng: posicion.lng,
          registrada_en: posicion.registradaEn,
          velocidad_ms: posicion.velocidadMs,
          viaje_id: viajeId,
        },
        { onConflict: 'viaje_id' },
      );
    },
    suscribir(oyente) {
      const dejar = local.suscribir(oyente);
      oyentes += 1;
      if (oyentes === 1) {
        void sincronizar();
        temporizador = setInterval(() => void sincronizar(), cadaMs);
      }
      return () => {
        dejar();
        oyentes -= 1;
        if (oyentes === 0 && temporizador) {
          clearInterval(temporizador);
          temporizador = null;
        }
      };
    },
    ultima: (viajeId) => local.ultima(viajeId),
    version: () => local.version(),
  };
}
