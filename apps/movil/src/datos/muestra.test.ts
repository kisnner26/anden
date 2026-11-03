import {
  esquemaBus,
  esquemaCalificacion,
  esquemaChofer,
  esquemaRuta,
  esquemaTerminal,
  esquemaViaje,
} from '@anden/dominio';
import { describe, expect, it } from '@jest/globals';

import { crearMuestra } from './muestra';

const AHORA = new Date('2026-11-02T20:00:00.000Z');

describe('crearMuestra', () => {
  const datos = crearMuestra(AHORA);

  it('cumple los esquemas del dominio', () => {
    for (const terminal of datos.terminales) {
      expect(esquemaTerminal.safeParse(terminal).success).toBe(true);
    }
    for (const ruta of datos.rutas) {
      expect(esquemaRuta.safeParse(ruta).success).toBe(true);
    }
    for (const bus of datos.buses) {
      expect(esquemaBus.safeParse(bus).success).toBe(true);
    }
    for (const chofer of datos.choferes) {
      expect(esquemaChofer.safeParse(chofer).success).toBe(true);
    }
    for (const viaje of datos.viajes) {
      expect(esquemaViaje.safeParse(viaje).success).toBe(true);
    }
  });

  it('rotula todas las tarifas como de muestra', () => {
    expect(datos.tarifario.length).toBeGreaterThan(0);
    for (const tarifa of datos.tarifario) {
      expect(tarifa.resolucion).toBe('muestra');
    }
  });

  it('sitúa las salidas respecto de la hora recibida', () => {
    const primera = datos.viajes[0];
    expect(primera && new Date(primera.salida).getTime()).toBe(
      AHORA.getTime() - 10 * 60_000,
    );
  });

  it('incluye retornos de cada terminal de muestra a Managua', () => {
    for (const ruta of datos.rutas.filter((ruta) => ruta.destinoId === 'ter_uca')) {
      expect(datos.viajes.some((viaje) => viaje.rutaId === ruta.id)).toBe(true);
    }
  });

  it('trae calificaciones válidas para cada chofer', () => {
    expect(datos.calificaciones.length).toBeGreaterThan(40);
    for (const calificacion of datos.calificaciones) {
      expect(esquemaCalificacion.safeParse(calificacion).success).toBe(true);
    }
    for (const chofer of datos.choferes) {
      const propias = datos.calificaciones.filter(
        (c) => c.choferId === chofer.id,
      );
      expect(propias.length).toBeGreaterThanOrEqual(5);
    }
  });
});
