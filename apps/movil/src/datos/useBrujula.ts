import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import type { Coordenada } from './geometria';

export type EstadoDeLectura =
  'cargando' | 'desactivado' | 'listo' | 'sin-permiso';

export interface LecturaDeBrujula {
  /** hacia dónde mira el teléfono, en grados desde el norte; nulo hasta que llegue la primera lectura */
  haciaDondeMira: number | null;
  posicion: Coordenada | null;
  estado: EstadoDeLectura;
}

/**
 * dónde estás y hacia dónde mira el teléfono, en vivo, mientras `activa`; pide el permiso de ubicación si falta y lo
 * suelta todo al cerrarse. Sin permiso o con la ubicación apagada lo dice en `estado`
 */
export function useBrujula(activa: boolean): LecturaDeBrujula {
  const [posicion, establecerPosicion] = useState<Coordenada | null>(null);
  const [haciaDondeMira, establecerMira] = useState<number | null>(null);
  const [estado, establecerEstado] = useState<EstadoDeLectura>('cargando');

  useEffect(() => {
    if (!activa) return;
    let vigente = true;
    const suscripciones: { remove: () => void }[] = [];

    async function empezar() {
      try {
        if ((await Location.hasServicesEnabledAsync()) === false) {
          if (vigente) establecerEstado('desactivado');
          return;
        }
        const permiso = await Location.requestForegroundPermissionsAsync();
        if (permiso.status !== 'granted') {
          if (vigente) establecerEstado('sin-permiso');
          return;
        }
        const posiciones = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 3 },
          (lectura) => {
            if (!vigente) return;
            establecerPosicion({
              lat: lectura.coords.latitude,
              lng: lectura.coords.longitude,
            });
            establecerEstado('listo');
          },
        );
        suscripciones.push(posiciones);
        const rumbos = await Location.watchHeadingAsync((lectura) => {
          if (!vigente) return;
          // el norte verdadero cuando se sabe; si no, el magnético
          establecerMira(
            lectura.trueHeading >= 0 ? lectura.trueHeading : lectura.magHeading,
          );
        });
        suscripciones.push(rumbos);
        if (!vigente) suscripciones.forEach((s) => s.remove());
      } catch {
        if (vigente) establecerEstado('desactivado');
      }
    }
    void empezar();

    return () => {
      vigente = false;
      suscripciones.forEach((s) => s.remove());
    };
  }, [activa]);

  return { estado, haciaDondeMira, posicion };
}
