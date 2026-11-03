import { describe, expect, it } from '@jest/globals';

import {
  CORREDORES_INICIALES,
  OPERACION_MUESTRA_POR_CORREDOR,
} from './corredores';

describe('CORREDORES_INICIALES', () => {
  it('solo publica Wácwala y Chagüilpa hacia Managua', () => {
    expect(CORREDORES_INICIALES).toEqual([
      { destino: 'Managua', id: 'cor_wac_man', origen: 'Wácwala' },
      { destino: 'Managua', id: 'cor_cha_man', origen: 'Chagüilpa' },
    ]);
  });

  it('distingue una próxima unidad del estado sin servicio', () => {
    expect(OPERACION_MUESTRA_POR_CORREDOR.cor_wac_man).toEqual({
      estado: 'proxima',
      etaMinutos: 18,
      proximaSalida: '6:30 a. m.',
    });
    expect(OPERACION_MUESTRA_POR_CORREDOR.cor_cha_man).toEqual({
      estado: 'sin_servicio',
      etaMinutos: null,
      proximaSalida: null,
    });
  });
});
