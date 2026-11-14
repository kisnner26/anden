import { describe, expect, it } from '@jest/globals';

import type { Humor } from '@/datos/mascota';
import { renderPantalla } from '@/pruebas/render';

import { MascotaPito } from './MascotaPito';

describe('MascotaPito', () => {
  it.each([
    'alerta',
    'celebrando',
    'dormido',
    'feliz',
    'pensando',
    'saludando',
  ] as Humor[])('se dibuja con el ánimo %s', async (humor) => {
    const p = await renderPantalla(<MascotaPito humor={humor} />);
    expect(
      p.getByTestId(`mascota-pito-${humor}`, { includeHiddenElements: true }),
    ).toBeTruthy();
  });

  it('es decorativa: se oculta a los lectores de pantalla', async () => {
    const p = await renderPantalla(<MascotaPito />);
    const pito = p.getByTestId('mascota-pito-feliz', {
      includeHiddenElements: true,
    });
    expect(pito.props.accessibilityElementsHidden).toBe(true);
  });
});
