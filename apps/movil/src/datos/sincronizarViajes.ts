import type { Bus, Chofer, Ocupacion, Viaje } from '@anden/dominio';

import {
  leerViajesPublicados,
  type ViajesPublicados,
} from '@/servicios/supabase/viajesSupabase';

import { DUENO_REMOTO } from './asientosRemotos';
import { fijarHistorial } from './historialSalidas';
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
  // los que ya arrancaron dejan la lista: solo se muestran los que esperan pasajeros
  for (const fila of publicados.viajes.filter((v) => !v.salio_en)) {
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
      anden: fila.anden,
      busId,
      choferId: fila.chofer_id,
      estado: 'programado',
      id: fila.id,
      minutosAtraso: 0,
      rutaId: fila.ruta_id,
      salida: new Date(fila.salida).toISOString(),
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

/** trae los viajes publicados y avisa a las pantallas; devuelve si hubo respuesta del servidor */
export async function sincronizarViajes(
  desde: Date = new Date(Date.now() - 6 * 3_600_000),
): Promise<boolean> {
  const publicados = await leerViajesPublicados(desde);
  if (publicados === null) return false;
  aplicarViajesPublicados(obtenerMuestra(), publicados);
  notificarCambioDeViajes();
  return true;
}
