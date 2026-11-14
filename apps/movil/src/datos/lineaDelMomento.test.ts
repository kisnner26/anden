import { describe, expect, it } from '@jest/globals';

import { lineaDelMomento } from './lineaDelMomento';

const AHORA = new Date(2026, 10, 14, 9, 0);
const hoy = (h: number) => new Date(2026, 10, 14, h, 0);

describe('lineaDelMomento', () => {
  it('con un boleto para hoy lo recuerda con su hora', () => {
    expect(
      lineaDelMomento({
        ahora: AHORA,
        boletoProximo: { destino: 'Boaco', salida: hoy(15) },
        habitual: null,
        proxima: null,
      }),
    ).toBe('Tu bus a Boaco sale a las 3:00 p. m.');
  });

  it('sin boleto ofrece la salida de su destino de siempre', () => {
    expect(
      lineaDelMomento({
        ahora: AHORA,
        boletoProximo: null,
        habitual: 'Boaco',
        proxima: { destino: 'Boaco', salida: hoy(11) },
      }),
    ).toBe('Tu viaje de siempre a Boaco sale a las 11:00 a. m.');
  });

  it('sin nada que decir saluda según la hora', () => {
    const base = { boletoProximo: null, habitual: null, proxima: null };
    expect(lineaDelMomento({ ...base, ahora: hoy(9) })).toBe(
      'Buenos días. ¿A dónde vas hoy?',
    );
    expect(lineaDelMomento({ ...base, ahora: hoy(15) })).toBe(
      'Buenas tardes. ¿A dónde vas?',
    );
    expect(lineaDelMomento({ ...base, ahora: hoy(21) })).toBe(
      'Buenas noches. ¿Viajás mañana?',
    );
  });

  it('un boleto que ya salió no se recuerda', () => {
    expect(
      lineaDelMomento({
        ahora: AHORA,
        boletoProximo: { destino: 'Boaco', salida: hoy(7) },
        habitual: null,
        proxima: null,
      }),
    ).toBe('Buenos días. ¿A dónde vas hoy?');
  });
});
