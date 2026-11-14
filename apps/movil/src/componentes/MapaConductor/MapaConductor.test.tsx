import { describe, expect, it } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

import { MapaConductor } from './MapaConductor';

const TRAZO = [
  { lat: 12.13, lng: -86.25 },
  { lat: 12.46, lng: -85.66 },
];

describe('MapaConductor', () => {
  it('dibuja el mapa a pantalla completa con el bus encima', async () => {
    const p = await renderPantalla(
      <MapaConductor
        bus={{ lat: 12.3, lng: -86 }}
        centrar={0}
        destino={{ coordenadas: TRAZO[1]!, nombre: 'Boaco' }}
        espacioInferior={300}
        origen={{ coordenadas: TRAZO[0]!, nombre: 'Managua' }}
        trazo={TRAZO}
      />,
    );
    expect(
      p.getByTestId('mapa-conductor', { includeHiddenElements: true }),
    ).toBeTruthy();
    expect(
      p.getByTestId('bus-conductor', { includeHiddenElements: true }),
    ).toBeTruthy();
  });

  it('sin posición del bus solo se ve el camino', async () => {
    const p = await renderPantalla(
      <MapaConductor
        centrar={0}
        destino={{ coordenadas: TRAZO[1]!, nombre: 'Boaco' }}
        espacioInferior={300}
        origen={{ coordenadas: TRAZO[0]!, nombre: 'Managua' }}
        trazo={TRAZO}
      />,
    );
    expect(
      p.queryByTestId('bus-conductor', { includeHiddenElements: true }),
    ).toBeNull();
  });
});
