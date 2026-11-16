import { useEffect, useRef, useState } from 'react';

import { detenerTransmision } from '@/datos/transmisor';
import {
  LLEGADA_INICIAL,
  seguirLlegada,
  type EstadoLlegada,
} from '@/datos/llegadaAutomatica';
import { progresoSobreTrazo } from '@/datos/progresoViaje';
import { unirBoletos, useBoletosDelViaje } from '@/datos/useBoletosDelViaje';
import { useBoletos } from '@/datos/useBoletos';
import { useCierres } from '@/datos/useCierres';
import { useDetalleViaje } from '@/datos/useDetalleViaje';
import { usePagos } from '@/datos/usePagos';
import { useRecorrido } from '@/datos/useRecorrido';
import { useSesion } from '@/datos/useSesion';
import { useSonidos } from '@/datos/useSonidos';
import { useTransmision, useViajesEnVivo } from '@/datos/useTransmision';
import { trayectoDelViaje } from '@/datos/trayectoDelViaje';
import { armarCierre } from '@/servicios/cierres';
import { sincronizarViajes } from '@/datos/sincronizarViajes';
import { marcarLlegada } from '@/servicios/supabase/viajesSupabase';

/**
 * vigila un viaje que se está compartiendo: cuando la posición llega al destino marcado en el mapa y se mantiene
 * ahí, lo cierra solo con el cobro tal como está. No dibuja nada
 */
function VigiaDelViaje({ viajeId }: { viajeId: string }) {
  const { sesion } = useSesion();
  const detalle = useDetalleViaje(viajeId);
  const recorrido = useRecorrido(
    detalle?.origenCiudad ?? '',
    detalle?.salida.destino ?? '',
  );
  const transmision = useTransmision(viajeId);
  const { boletos: locales } = useBoletos();
  const { boletos: remotos } = useBoletosDelViaje(viajeId);
  const { registro } = usePagos();
  const { cerrar, cierreDe } = useCierres();
  const sonar = useSonidos();
  const [estado, establecerEstado] = useState<EstadoLlegada>(LLEGADA_INICIAL);
  const cerrando = useRef(false);

  const progreso =
    transmision.posicion && recorrido && detalle
      ? progresoSobreTrazo(
          recorrido.trazo,
          transmision.posicion,
          detalle.duracionMin,
        )
      : null;

  useEffect(() => {
    establecerEstado((previo) =>
      seguirLlegada(previo, progreso, Date.now(), !transmision.sinSenal),
    );
  }, [progreso, transmision.sinSenal]);

  useEffect(() => {
    if (!estado.llego || cerrando.current) return;
    if (!sesion?.choferId || cierreDe(viajeId)) return;
    cerrando.current = true;
    const pasajeros = unirBoletos(locales, remotos).filter(
      ({ boleto }) =>
        boleto.viajeId === viajeId && boleto.estado !== 'cancelado',
    );
    const resumen = armarCierre(
      pasajeros.map(({ boleto }) => ({
        asiento: boleto.asiento,
        boletoId: boleto.id,
        nombre: boleto.pasajero.nombre,
        precio: boleto.precio,
      })),
      registro,
      viajeId,
      sesion.choferId,
      new Date(),
      trayectoDelViaje(viajeId),
    );
    detenerTransmision(viajeId);
    void cerrar(resumen).then(() => sonar('fin'));
    void marcarLlegada(viajeId).then(() => sincronizarViajes());
  }, [
    cerrar,
    cierreDe,
    estado.llego,
    locales,
    registro,
    remotos,
    sesion?.choferId,
    sonar,
    viajeId,
  ]);

  return null;
}

/** un vigía por cada viaje que se está compartiendo desde este teléfono; no depende de qué pantalla esté abierta */
export function CierreAutomatico() {
  const activos = useViajesEnVivo();
  return (
    <>
      {activos.map((viajeId) => (
        <VigiaDelViaje key={viajeId} viajeId={viajeId} />
      ))}
    </>
  );
}
