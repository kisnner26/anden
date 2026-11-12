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
  distanciaKm: 83,
  duracionMin: 79,
  origen: {
    codigo: 'BOA',
    coordenadas: { lat: 12.47, lng: -85.66 },
    nombre: 'Terminal de Buses de Boaco',
  },
  porcentaje: 50,
  restantes: 50,
  trazo: [
    { lat: 12.47, lng: -85.66 },
    { lat: 12.3, lng: -85.9 },
    { lat: 12.13, lng: -86.19 },
  ],
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

  it('sin bus dibuja solo el camino y las terminales', async () => {
    const { destino, origen, trazo } = SIMULACION;
    const pantalla = await renderPantalla(
      <MapaCorredor simulacion={{ destino, origen, trazo }} />,
    );
    expect(
      pantalla.getByTestId('mapa-corredor', { includeHiddenElements: true }),
    ).toBeTruthy();
    expect(
      pantalla.queryByTestId('bus-simulado', { includeHiddenElements: true }),
    ).toBeNull();
  });
});
