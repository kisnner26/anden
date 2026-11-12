import { describe, expect, it, jest } from '@jest/globals';
import { useReducedMotion } from 'react-native-reanimated';

import { renderPantalla } from '@/pruebas/render';
import { movimiento } from '@/tema/movimiento';

import { ExplosionConfirmacion } from './ExplosionConfirmacion';

describe('ExplosionConfirmacion', () => {
  it('dibuja las chispas y los anillos', async () => {
    const pantalla = await renderPantalla(<ExplosionConfirmacion />);
    const raiz = pantalla.getByTestId('explosion-confirmacion', {
      includeHiddenElements: true,
    });
    // dos anillos más una chispa por cada indicada en el tema
    expect(raiz.children).toHaveLength(2 + movimiento.chispas);
  });

  it('no dibuja nada con reducir movimiento', async () => {
    jest.mocked(useReducedMotion).mockReturnValueOnce(true);
    const pantalla = await renderPantalla(<ExplosionConfirmacion />);
    expect(
      pantalla.queryByTestId('explosion-confirmacion', {
        includeHiddenElements: true,
      }),
    ).toBeNull();
  });
});
