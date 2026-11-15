import { describe, expect, it } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

import { SiluetaDeBus } from './SiluetaDeBus';

describe('SiluetaDeBus', () => {
  it('se dibuja y no estorba al lector de pantalla', async () => {
    const p = await renderPantalla(<SiluetaDeBus proporcion={0.5} />);
    expect(
      p.getByTestId('silueta-de-bus', { includeHiddenElements: true }),
    ).toBeTruthy();
    expect(p.queryByTestId('silueta-de-bus')).toBeNull();
  });
});
