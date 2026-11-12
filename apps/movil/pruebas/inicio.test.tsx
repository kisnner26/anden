import { describe, expect, it } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

import Inicio from '../app/index';

describe('Inicio', () => {
  it('muestra la portada la primera vez', async () => {
    const pantalla = await renderPantalla(<Inicio />);
    expect(
      await pantalla.findByRole('button', { name: 'Deslizar para empezar' }),
    ).toBeTruthy();
  });
});
