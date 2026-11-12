import { describe, expect, it } from '@jest/globals';

import type { ProgresoViaje } from '@/datos/progresoViaje';
import { renderPantalla } from '@/pruebas/render';

import { SeguimientoEnVivo } from './SeguimientoEnVivo';

const PROGRESO: ProgresoViaje = {
  desvioKm: 0.1,
  fraccion: 0.4,
  fueraDeRuta: false,
  kmRecorridos: 33.2,
  kmRestantes: 49.7,
  minutosRestantes: 47,
  porcentaje: 40,
};

describe('SeguimientoEnVivo', () => {
  it('muestra cuánto falta, cuánto lleva y los kilómetros', async () => {
    const pantalla = await renderPantalla(
      <SeguimientoEnVivo progreso={PROGRESO} sinSenal={false} />,
    );
    expect(pantalla.getByText('En vivo')).toBeTruthy();
    expect(pantalla.getByText('Llega en unos 47 min (ETA)')).toBeTruthy();
    expect(pantalla.getByText('Va por el 40 % del recorrido')).toBeTruthy();
    expect(
      pantalla.getByText('33.2 km recorridos · 49.7 km restantes'),
    ).toBeTruthy();
  });

  it('sin posición todavía dice que espera', async () => {
    const pantalla = await renderPantalla(
      <SeguimientoEnVivo progreso={null} sinSenal={false} />,
    );
    expect(pantalla.getByText(/esperando su posición/)).toBeTruthy();
  });

  it('si se perdió la señal lo dice en vez de mostrar un tiempo viejo', async () => {
    const pantalla = await renderPantalla(
      <SeguimientoEnVivo progreso={PROGRESO} sinSenal />,
    );
    expect(pantalla.getByText('Sin señal reciente de la unidad.')).toBeTruthy();
    expect(pantalla.queryByText('Llega en unos 47 min (ETA)')).toBeNull();
  });

  it('avisa si la unidad está lejos de la ruta', async () => {
    const pantalla = await renderPantalla(
      <SeguimientoEnVivo
        progreso={{ ...PROGRESO, fueraDeRuta: true }}
        sinSenal={false}
      />,
    );
    expect(
      pantalla.getByText('La unidad está lejos de la ruta habitual.'),
    ).toBeTruthy();
  });
});
