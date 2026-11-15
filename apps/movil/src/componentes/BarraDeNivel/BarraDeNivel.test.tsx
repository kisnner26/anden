import { describe, expect, it } from '@jest/globals';

import { nivelDelPasaporte } from '@/datos/identidadPasaporte';
import { renderPantalla } from '@/pruebas/render';

import { BarraDeNivel } from './BarraDeNivel';

describe('BarraDeNivel', () => {
  it('dice el nivel y cuántos viajes faltan, en singular y plural', async () => {
    const uno = await renderPantalla(
      <BarraDeNivel avance={nivelDelPasaporte(0)} />,
    );
    expect(uno.getByText('Aspirante')).toBeTruthy();
    expect(uno.getByText('Te falta 1 viaje para ser Pasajero.')).toBeTruthy();
    const varios = await renderPantalla(
      <BarraDeNivel avance={nivelDelPasaporte(7)} />,
    );
    expect(varios.getByText('Viajero frecuente')).toBeTruthy();
    expect(
      varios.getByText('Te faltan 3 viajes para ser Viajero.'),
    ).toBeTruthy();
  });

  it('en el nivel más alto lo celebra', async () => {
    const p = await renderPantalla(
      <BarraDeNivel avance={nivelDelPasaporte(30)} />,
    );
    expect(p.getByText('Trotamundos')).toBeTruthy();
    expect(p.getByText(/nivel más alto/)).toBeTruthy();
  });
});
