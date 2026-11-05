import { describe, expect, it } from '@jest/globals';

import {
  CORREDORES_INICIALES,
  OPERACION_MUESTRA_POR_CORREDOR,
} from './corredores';

describe('CORREDORES_INICIALES', () => {
  it('publica Boaco y Juigalpa con Managua en ambos sentidos', () => {
    expect(CORREDORES_INICIALES).toEqual([
      { destino: 'Managua', id: 'cor_boa_man', origen: 'Boaco' },
      { destino: 'Boaco', id: 'cor_man_boa', origen: 'Managua' },
      { destino: 'Juigalpa', id: 'cor_man_jui', origen: 'Managua' },
      { destino: 'Managua', id: 'cor_jui_man', origen: 'Juigalpa' },
    ]);
  });

  it('distingue una próxima unidad del estado sin servicio', () => {
    expect(OPERACION_MUESTRA_POR_CORREDOR.cor_boa_man).toEqual({
      estado: 'proxima',
      proximaSalida: '6:30 a. m.',
    });
    expect(OPERACION_MUESTRA_POR_CORREDOR.cor_jui_man).toEqual({
      estado: 'sin_servicio',
      proximaSalida: null,
    });
    expect(OPERACION_MUESTRA_POR_CORREDOR.cor_boa_man).not.toHaveProperty(
      'etaMinutos',
    );
  });
});
