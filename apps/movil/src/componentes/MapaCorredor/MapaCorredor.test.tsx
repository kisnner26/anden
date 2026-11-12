import { describe, expect, it } from '@jest/globals';

import type { BusSimulado } from '@/datos/useBusSimulado';
import { renderPantalla } from '@/pruebas/render';

import { MapaCorredor } from './MapaCorredor';

const SIMULACION: BusSimulado = {
  bus: { lat: 12.3, lng: -85.9 },
  destino: {
    codigo: 'MAY',
    coordenadas: { lat: 12.13, lng: -86.19 },
    nombre: 'Mercado Mayoreo',
  },
  duracionMin: 100,
  origen: {
    codigo: 'BOA',
    coordenadas: { lat: 12.47, lng: -85.66 },
    nombre: 'Terminal de Buses de Boaco',
  },
  porcentaje: 50,
  restantes: 50,
};

describe('MapaCorredor', () => {
  it('dibuja el mapa con el bus', async () => {
    const pantalla = await renderPantalla(
      <MapaCorredor simulacion={SIMULACION} />,
    );
    expect(
      pantalla.getByTestId('mapa-corredor', { includeHiddenElements: true }),
    ).toBeTruthy();
    expect(
      pantalla.getByTestId('bus-simulado', { includeHiddenElements: true }),
    ).toBeTruthy();
  });

  it('muestra el código de las dos terminales', async () => {
    const pantalla = await renderPantalla(
      <MapaCorredor simulacion={SIMULACION} />,
    );
    expect(
      pantalla.getByText('BOA', { includeHiddenElements: true }),
    ).toBeTruthy();
    expect(
      pantalla.getByText('MAY', { includeHiddenElements: true }),
    ).toBeTruthy();
  });
});
