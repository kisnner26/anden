import { describe, expect, it } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

import { IlustracionAtajo, type TipoAtajo } from './IlustracionAtajo';

describe('IlustracionAtajo', () => {
  it.each<TipoAtajo>(['boletos', 'horarios', 'rutas'])(
    'dibuja la ilustración de %s',
    async (tipo) => {
      const p = await renderPantalla(<IlustracionAtajo tipo={tipo} />);
      expect(
        p.getByTestId(`ilustracion-${tipo}`, { includeHiddenElements: true }),
      ).toBeTruthy();
    },
  );
});
