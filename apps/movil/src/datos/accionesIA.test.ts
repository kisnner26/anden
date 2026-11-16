import { describe, expect, it } from '@jest/globals';

import { accionDeOrden, leerAcciones, minutosValidos } from './accionesIA';
import { interpretarOrden } from './ordenesIA';

describe('minutosValidos', () => {
  it('acerca lo pedido al aviso más cercano que la app programa', () => {
    expect(minutosValidos(10)).toBe(15);
    expect(minutosValidos(40)).toBe(30);
    expect(minutosValidos(50)).toBe(60);
    expect(minutosValidos(600)).toBe(60);
  });

});
