import { describe, expect, it } from '@jest/globals';

import { boletoDePrueba } from '@/pruebas/boletos';

import { estadoVisibleBoleto, minutosHastaSalida } from './estadoBoleto';

describe('estado visible de boleto', () => {
  it('muestra vigente y los minutos hasta una salida futura', () => {
    const ahora = new Date('2026-11-03T12:00:00.000Z');
    const guardado = boletoDePrueba(new Date('2026-11-03T12:31:00.000Z'));

    expect(estadoVisibleBoleto(guardado, ahora)).toBe('vigente');
    expect(minutosHastaSalida(guardado, ahora)).toBe(31);
  });
});
