import { useCallback, useEffect, useState } from 'react';

import { obtenerCliente } from '@/servicios/supabase/cliente';
import {
  enviarMensaje,
  leerMensajes,
} from '@/servicios/supabase/mensajesSupabase';
import { useAppActiva } from '@/tema/useAppActiva';

import { guardarMensajeLocal, leerMensajesLocales } from './mensajesLocales';
import {
  ordenarMensajes,
  sinLeer,
  textoDeMensaje,
  type AutorMensaje,
  type MensajeViaje,
} from './mensajesViaje';

/** cada cuánto se pregunta por mensajes nuevos mientras la conversación está abierta o hay viaje */
export const SEGUNDOS_ENTRE_LECTURAS = 4;

export interface ConversacionViaje {
  /** envía el texto; falso si estaba vacío, pasaba del máximo o el servidor lo rechazó */
  enviar: (texto: string) => Promise<boolean>;
  /** da por leído todo lo que hay hasta ahora */
  marcarVisto: () => void;
  mensajes: MensajeViaje[];
  sinLeer: number;
}

/**
 * la conversación de una persona con la otra en un viaje: se lee cada pocos segundos mientras la app
 * está a la vista y la conversación está activa, y lo que se envía aparece al instante
 */
export function useMensajesViaje(
  viajeId: string,
  hilo: string,
  yo: AutorMensaje,
  activa: boolean,
): ConversacionViaje {
  const aLaVista = useAppActiva();
  const [mensajes, establecerMensajes] = useState<MensajeViaje[]>([]);
  const [visto, establecerVisto] = useState<string | null>(null);

  const leer = useCallback(async () => {
    const remotos = await leerMensajes(viajeId, hilo);
    establecerMensajes(
      ordenarMensajes(remotos ?? leerMensajesLocales(viajeId, hilo)),
    );
  }, [hilo, viajeId]);

  useEffect(() => {
    if (!activa || !aLaVista || hilo === '') return;
    void leer();
    const intervalo = setInterval(
      () => void leer(),
      SEGUNDOS_ENTRE_LECTURAS * 1000,
    );
    return () => clearInterval(intervalo);
  }, [activa, aLaVista, hilo, leer]);

  const enviar = useCallback(
    async (texto: string) => {
      const limpio = textoDeMensaje(texto);
      if (limpio === null || !activa) return false;
      const nuevo = { de: yo, hilo, texto: limpio, viajeId };
      let enviado = await enviarMensaje(nuevo);
      if (!enviado && obtenerCliente() === null) {
        guardarMensajeLocal({
          ...nuevo,
          enviadoEn: new Date().toISOString(),
          id: `loc_${Date.now()}`,
        });
        enviado = true;
      }
      if (enviado) await leer();
      return enviado;
    },
    [activa, hilo, leer, viajeId, yo],
  );

  const marcarVisto = useCallback(() => {
    establecerVisto(mensajes.at(-1)?.enviadoEn ?? null);
  }, [mensajes]);

  return {
    enviar,
    marcarVisto,
    mensajes,
    sinLeer: sinLeer(mensajes, yo, visto),
  };
}
