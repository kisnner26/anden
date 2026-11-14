import { describe, expect, it } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

import { PaisajePortada } from './PaisajePortada';

describe('PaisajePortada', () => {
  it('se dibuja sin movimiento cuando se pidió reducirlo', async () => {
    const p = await renderPantalla(
      <PaisajePortada alto={800} ancho={400} reducido yMarca={260} />,
    );
    expect(p.toJSON()).not.toBeNull();
  });

  it('también con movimiento y en modo rápido', async () => {
    const p = await renderPantalla(
      <PaisajePortada alto={800} ancho={400} rapido yMarca={260} />,
    );
    expect(p.toJSON()).not.toBeNull();
  });
});
