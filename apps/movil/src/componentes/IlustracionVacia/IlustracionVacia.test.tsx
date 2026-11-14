import { describe, expect, it } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

import { IlustracionVacia } from './IlustracionVacia';

describe('IlustracionVacia', () => {
  it.each(['boletos', 'error', 'salidas'] as const)(
    'dibuja la ilustración de %s',
    async (tipo) => {
      const p = await renderPantalla(<IlustracionVacia tipo={tipo} />);
      expect(
        p.getByTestId(`ilustracion-${tipo}`, { includeHiddenElements: true }),
      ).toBeTruthy();
    },
  );

  it('es decorativa: se oculta a los lectores de pantalla', async () => {
    const p = await renderPantalla(<IlustracionVacia tipo="boletos" />);
    const dibujo = p.getByTestId('ilustracion-boletos', {
      includeHiddenElements: true,
    });
    expect(dibujo.props.accessibilityElementsHidden).toBe(true);
  });
});
