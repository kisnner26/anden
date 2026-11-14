import { describe, expect, it } from '@jest/globals';

import type { Humor } from '@/datos/mascota';
import { renderPantalla } from '@/pruebas/render';

import { MascotaRumbo } from './MascotaRumbo';

describe('MascotaRumbo', () => {
  it.each([
    'alerta',
    'celebrando',
    'dormido',
    'feliz',
    'pensando',
    'saludando',
  ] as Humor[])('se dibuja con el ánimo %s', async (humor) => {
    const p = await renderPantalla(<MascotaRumbo humor={humor} />);
    expect(
      p.getByTestId(`mascota-rumbo-${humor}`, { includeHiddenElements: true }),
    ).toBeTruthy();
  });

  it('es decorativa: se oculta a los lectores de pantalla', async () => {
    const p = await renderPantalla(<MascotaRumbo />);
    const rumbo = p.getByTestId('mascota-rumbo-feliz', {
      includeHiddenElements: true,
    });
    expect(rumbo.props.accessibilityElementsHidden).toBe(true);
  });
});
