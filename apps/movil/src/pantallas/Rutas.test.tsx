import { describe, expect, it } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

import { Rutas } from './Rutas';

describe('Rutas', () => {
  it('anuncia que el mapa llega pronto', async () => {
    const pantalla = await renderPantalla(<Rutas />);
    expect(
      pantalla.getByText('El mapa de rutas autorizadas llega pronto.'),
    ).toBeTruthy();
  });
});
