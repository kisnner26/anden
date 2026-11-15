import type { Bus, Chofer, Ocupacion, Viaje } from '@anden/dominio';

import {
  leerViajesPublicados,
  type ViajesPublicados,
} from '@/servicios/supabase/viajesSupabase';

import { DUENO_REMOTO } from './asientosRemotos';
import { guardarCacheViajes, leerCacheViajes } from './cacheViajes';
import {
  fijarBusquedas,
  fijarCancelados,
  fijarHistorial,
  fijarMotivos,
} from './historialSalidas';
import { CONFIGURACION_POR_SERVICIO, type DatosMuestra } from './muestra';
import { notificarCambioDeViajes, obtenerMuestra } from './useSalidas';

const COOPERATIVA = 'Cooperativa';

/** el chofer de un viaje; si todavía no publicó su perfil se muestra con un nombre genérico */
function choferDe(
  id: string,
  publicados: ViajesPublicados['choferes'],
): Chofer {
  const perfil = publicados.find((fila) => fila.chofer_id === id);
  return {
    aniosManejando: 0,
    fotoUrl: perfil?.foto_url ?? '',
    id,
    licenciaVerificada: true,
    nombre: perfil?.nombre ?? 'Conductor',
    viajesRealizados: 0,
  };
}

/** pasa lo publicado en el servidor a las listas que usa la app, sin tocar lo que es de este teléfono */
export function aplicarViajesPublicados(
  datos: DatosMuestra,
  publicados: ViajesPublicados,
): void {
  const viajes: Viaje[] = [];
  const buses: Bus[] = [];
  const idsChofer = new Set<string>();
  // los que ya arrancaron se quedan: los boletos de esos viajes tienen que ver que van en ruta o que ya llegaron
  for (const fila of publicados.viajes) {
    const busId = `bus_${fila.id}`;
    idsChofer.add(fila.chofer_id);
    buses.push({
      comodidades:
        fila.servicio === 'expreso' ? ['aire-acondicionado', 'carga-usb'] : [],
      configuracion: CONFIGURACION_POR_SERVICIO[fila.servicio],
      cooperativa: COOPERATIVA,
      id: busId,
      placa: fila.placa,
      servicio: fila.servicio,
    });
    viajes.push({
      puntoEncuentro: fila.punto_encuentro ?? '',
      busId,
      choferId: fila.chofer_id,
      estado: fila.estado === 'llego' ? 'llego' : 'programado',
      id: fila.id,
      minutosAtraso: 0,
      rutaId: fila.ruta_id,
      // si el conductor ya arrancó, la salida es la hora real: así el boleto pasa a "en ruta" cuando él lo inicia
      salida: new Date(fila.salio_en ?? fila.salida).toISOString(),
    });
  }
  const choferes = [...idsChofer].map((id) =>
    choferDe(id, publicados.choferes),
  );

  // los asientos vendidos por otros teléfonos; lo propio (boletos y retenciones) se conserva
  const idsViaje = new Set(viajes.map((viaje) => viaje.id));
  const propias = datos.ocupaciones.filter(
    (ocupacion) =>
      idsViaje.has(ocupacion.viajeId) &&
      !(ocupacion.estado === 'vendido' && ocupacion.duenoId === DUENO_REMOTO),
  );
  const remotas: Ocupacion[] = [];
  for (const fila of publicados.ocupacion) {
    if (!idsViaje.has(fila.viaje_id)) continue;
    const yaTomado = propias.some(
      (ocupacion) =>
        ocupacion.viajeId === fila.viaje_id &&
        ocupacion.asiento === fila.asiento &&
        ocupacion.estado === 'vendido',
    );
    if (yaTomado) continue;
    remotas.push({
      asiento: fila.asiento,
      boletoId: `${DUENO_REMOTO}_${fila.viaje_id}_${fila.asiento}`,
      duenoId: DUENO_REMOTO,
      estado: 'vendido',
      viajeId: fila.viaje_id,
    });
  }

  fijarBusquedas(
    Object.fromEntries(
      publicados.viajes.flatMap((fila) =>
        fila.busca_hasta
          ? [
              [
                fila.id,
                {
                  hasta: new Date(fila.busca_hasta),
                  mensaje: fila.busca_mensaje ?? null,
                },
              ],
            ]
          : [],
      ),
    ),
  );
  fijarCancelados(publicados.cancelados ?? []);
  fijarMotivos(publicados.motivos ?? {});
  fijarHistorial(
    (publicados.historial ?? []).map((fila) => {
      const puesto = new Date(fila.salida);
      return {
        esperaMin: Math.max(
          0,
          (new Date(fila.salio_en).getTime() - puesto.getTime()) / 60_000,
        ),
        horaDeInicio: puesto.getHours(),
        rutaId: fila.ruta_id,
        servicio: fila.servicio,
      };
    }),
  );
  datos.viajes = viajes;
  datos.buses = buses;
  datos.choferes = choferes;
  datos.ocupaciones = [...propias, ...remotas];
}

let ultimaSincronizacion: Date | null = null;

/** cuándo se pusieron al día los viajes por última vez, con el servidor o con lo guardado; nulo si nunca */
export function obtenerUltimaSincronizacion(): Date | null {
  return ultimaSincronizacion;
}

/** solo para las pruebas */
export function reiniciarUltimaSincronizacion(): void {
  ultimaSincronizacion = null;
}

let enCurso: Promise<boolean> | null = null;
let enEspera: Promise<boolean> | null = null;

/**
 * trae los viajes publicados, los guarda en el teléfono para cuando no haya señal y avisa a las pantallas;
 * devuelve si hubo respuesta del servidor. Nunca corren dos a la vez, porque una respuesta lenta y vieja podía pisar a
 * una nueva: si ya hay una en marcha, se hace una más justo después, y todas las llamadas de mientras comparten esa
 */
export function sincronizarViajes(
  desde: Date = new Date(Date.now() - 6 * 3_600_000),
): Promise<boolean> {
  if (enCurso === null) {
    const actual = sincronizarUna(desde).finally(() => {
      if (enCurso === actual) enCurso = null;
    });
    enCurso = actual;
    return actual;
  }
  if (enEspera === null) {
    enEspera = enCurso
      .catch(() => false)
      .then(() => {
        enEspera = null;
        return sincronizarViajes(desde);
      });
  }
  return enEspera;
}

async function sincronizarUna(desde: Date): Promise<boolean> {
  const publicados = await leerViajesPublicados(desde);
  if (publicados === null) return false;
  aplicarViajesPublicados(obtenerMuestra(), publicados);
  ultimaSincronizacion = new Date();
  void guardarCacheViajes(publicados, ultimaSincronizacion);
  notificarCambioDeViajes();
  return true;
}

/**
 * muestra lo último que se guardó del servidor: sirve al abrir la app sin internet. Devuelve si había algo,
 * y no pisa nada si ya hubo una sincronización más nueva
 */
export async function cargarViajesGuardados(): Promise<boolean> {
  const cache = await leerCacheViajes();
  if (cache === null) return false;
  const guardadoEn = new Date(cache.guardadoEn);
  if (ultimaSincronizacion !== null && ultimaSincronizacion >= guardadoEn) {
    return false;
  }
  aplicarViajesPublicados(obtenerMuestra(), cache.publicados);
  ultimaSincronizacion = guardadoEn;
  notificarCambioDeViajes();
  return true;
}
