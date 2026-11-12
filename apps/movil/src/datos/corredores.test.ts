import { describe, expect, it } from '@jest/globals';

import { CORREDORES_INICIALES } from './corredores';

describe('CORREDORES_INICIALES', () => {
  it('publica Boaco y Juigalpa con Managua en ambos sentidos', () => {
    expect(CORREDORES_INICIALES).toEqual([
      { destino: 'Managua', id: 'cor_boa_man', origen: 'Boaco' },
      { destino: 'Boaco', id: 'cor_man_boa', origen: 'Managua' },
      { destino: 'Juigalpa', id: 'cor_man_jui', origen: 'Managua' },
      { destino: 'Managua', id: 'cor_jui_man', origen: 'Juigalpa' },
    ]);
  });
});
