import * as Brightness from 'expo-brightness';
import { useEffect, useRef } from 'react';

/**
 * sube el brillo de la pantalla al máximo mientras `activo` y lo devuelve a como estaba al soltar; si el
 * teléfono no deja cambiarlo, el boleto se ve igual, solo que sin el brillo extra
 */
export function useBrilloMaximo(activo: boolean): void {
  const anterior = useRef<number | null>(null);

  useEffect(() => {
    let vigente = true;
    async function subir() {
      try {
        const actual = await Brightness.getBrightnessAsync();
        if (!vigente) return;
        anterior.current = actual;
        await Brightness.setBrightnessAsync(1);
      } catch {
        anterior.current = null;
      }
    }
    async function devolver() {
      const guardado = anterior.current;
      anterior.current = null;
      if (guardado === null) return;
      try {
        await Brightness.setBrightnessAsync(guardado);
      } catch {
        // si no se puede devolver, el sistema lo restaura al cerrar la app
      }
    }
    if (activo) void subir();
    else void devolver();
    return () => {
      vigente = false;
      void devolver();
    };
  }, [activo]);
}
