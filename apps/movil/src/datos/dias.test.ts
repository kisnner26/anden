import { describe, expect, it } from '@jest/globals';

import {
  DIAS_DE_RESERVA,
  diasDeReserva,
  inicioDelDia,
  mismoDia,
  nombreDelDia,
  sumarDias,
} from './dias';

const AHORA = new Date(2026, 10, 12, 15, 30);

describe('días', () => {
  it('el inicio del día es la medianoche local', () => {
    expect(inicioDelDia(AHORA).getTime()).toBe(
      new Date(2026, 10, 12).getTime(),
    );
  });

  it('dos horas del mismo día son el mismo día y otras no', () => {
    expect(
      mismoDia(new Date(2026, 10, 12, 0, 5), new Date(2026, 10, 12, 23, 59)),
    ).toBe(true);
    expect(
      mismoDia(new Date(2026, 10, 12, 23, 59), new Date(2026, 10, 13, 0, 1)),
    ).toBe(false);
  });

  it('suma días cruzando el fin de mes', () => {
    expect(sumarDias(new Date(2026, 10, 29, 20), 2).getTime()).toBe(
      new Date(2026, 11, 1).getTime(),
    );
  });

  it('ofrece hoy y los seis días siguientes', () => {
    const dias = diasDeReserva(AHORA);
    expect(dias).toHaveLength(DIAS_DE_RESERVA);
    expect(mismoDia(dias[0]!, AHORA)).toBe(true);
    expect(dias[6]?.getTime()).toBe(new Date(2026, 10, 18).getTime());
  });

  it('nombra hoy, mañana y los demás', () => {
    expect(nombreDelDia(new Date(2026, 10, 12, 23), AHORA)).toBe('hoy');
    expect(nombreDelDia(new Date(2026, 10, 13), AHORA)).toBe('manana');
    expect(nombreDelDia(new Date(2026, 10, 14), AHORA)).toBe('otro');
  });
});
