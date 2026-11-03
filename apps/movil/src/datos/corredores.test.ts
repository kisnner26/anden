import { describe, expect, it } from '@jest/globals';

import { CORREDORES_INICIALES } from './corredores';

describe('CORREDORES_INICIALES', () => {
  it('solo publica Wácwala y Chagüilpa hacia Managua', () => {
    expect(CORREDORES_INICIALES).toEqual([
      { destino: 'Managua', id: 'cor_wac_man', origen: 'Wácwala' },
      { destino: 'Managua', id: 'cor_cha_man', origen: 'Chagüilpa' },
    ]);
  });
});
