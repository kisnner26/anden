import { describe, expect, it } from '@jest/globals';

import {
  enElDestino,
  LLEGADA_INICIAL,
  seguirLlegada,
  SEGUNDOS_PARA_CONFIRMAR,
} from './llegadaAutomatica';
import type { ProgresoViaje } from './progresoViaje';

function progreso(extra: Partial<ProgresoViaje> = {}): ProgresoViaje {
  return {
    desvioKm: 0.1,
    fraccion: 0.99,
    fueraDeRuta: false,
    kmRecorridos: 80,
    kmRestantes: 0.1,
    minutosRestantes: 0,
    porcentaje: 99,
    ...extra,
  };
}

describe('enElDestino', () => {
  it('cerca del final del trazo y con la estimación cumplida', () => {
    expect(enElDestino(progreso())).toBe(true);
  });

  it('lejos todavía no', () => {
    expect(enElDestino(progreso({ kmRestantes: 3, minutosRestantes: 5 }))).toBe(
      false,
    );
  });

  it('fuera de la ruta no cuenta aunque esté cerca', () => {
    expect(enElDestino(progreso({ fueraDeRuta: true }))).toBe(false);
  });

  it('sin progreso no hay llegada', () => {
    expect(enElDestino(null)).toBe(false);
  });
});

describe('seguirLlegada', () => {
  it('no confirma de inmediato: espera a que se mantenga', () => {
    const uno = seguirLlegada(LLEGADA_INICIAL, progreso(), 0);
    expect(uno).toEqual({ desde: 0, llego: false });
    const dos = seguirLlegada(uno, progreso(), 10_000);
    expect(dos.llego).toBe(false);
  });

  it('confirma cuando se mantiene el tiempo necesario', () => {
    const uno = seguirLlegada(LLEGADA_INICIAL, progreso(), 0);
    const fin = seguirLlegada(uno, progreso(), SEGUNDOS_PARA_CONFIRMAR * 1000);
    expect(fin.llego).toBe(true);
  });

  it('si se aleja antes de confirmar, vuelve a empezar', () => {
    const uno = seguirLlegada(LLEGADA_INICIAL, progreso(), 0);
    const lejos = seguirLlegada(
      uno,
      progreso({ kmRestantes: 2, minutosRestantes: 4 }),
      20_000,
    );
    expect(lejos).toEqual(LLEGADA_INICIAL);
  });

  it('sin señal no se cuenta', () => {
    const uno = seguirLlegada(LLEGADA_INICIAL, progreso(), 0);
    expect(seguirLlegada(uno, progreso(), 60_000, false)).toEqual(
      LLEGADA_INICIAL,
    );
  });

  it('una vez que llegó se queda así', () => {
    const llego = { desde: 0, llego: true };
    expect(seguirLlegada(llego, null, 999_999)).toBe(llego);
  });
});
