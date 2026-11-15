import { describe, expect, it } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

import { IconoOjo } from './IconoOjo';

describe('IconoOjo', () => {
  it('se dibuja cerrado y abierto', async () => {
    const cerrado = await renderPantalla(<IconoOjo abierto={false} />);
    expect(cerrado.getByTestId('icono-ojo')).toBeTruthy();
    const abierto = await renderPantalla(<IconoOjo abierto />);
    expect(abierto.getByTestId('icono-ojo')).toBeTruthy();
  });
});
