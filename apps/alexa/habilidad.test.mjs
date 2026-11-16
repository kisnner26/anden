import { describe, expect, it } from 'vitest';

import {
  ciudadDe,
  diaHablado,
  horaHablada,
  proximaSalida,
  responder,
} from './habilidad.mjs';

const AHORA = new Date(2026, 10, 13, 10, 0);

function salida(id, hora, extra = {}) {
  return {
    asientosLibres: 12,
    destino: 'Boaco',
    id,
    salida: new Date(2026, 10, 13, hora, 0).toISOString(),
    tarifa: 66,
    ventaAbierta: true,
    ...extra,
  };
}

function pedido(intencion, ciudad) {
  return {
    request: {
      intent: {
        name: intencion,
        slots: ciudad ? { ciudad: { value: ciudad } } : {},
      },
      type: 'IntentRequest',
    },
  };
}

describe('ciudadDe', () => {
  it('reconoce una ciudad sin importar tildes ni mayúsculas', () => {
    expect(ciudadDe('BOACO')).toBe('Boaco');
    expect(ciudadDe(' juigalpa ')).toBe('Juigalpa');
  });

  it('devuelve nulo si no es una ciudad conocida', () => {
    expect(ciudadDe('León')).toBeNull();
    expect(ciudadDe(undefined)).toBeNull();
  });
});

describe('horaHablada', () => {
  it('dice la hora como se habla', () => {
    expect(horaHablada(new Date(2026, 10, 13, 15, 30))).toBe(
      '3 y media de la tarde',
    );
    expect(horaHablada(new Date(2026, 10, 13, 6, 0))).toBe('6 de la mañana');
    expect(horaHablada(new Date(2026, 10, 13, 19, 15))).toBe(
      '7 y 15 de la noche',
    );
  });

  it('distingue el mediodía y la medianoche', () => {
    expect(horaHablada(new Date(2026, 10, 13, 12, 0))).toBe('12 del mediodía');
    expect(horaHablada(new Date(2026, 10, 13, 0, 0))).toBe('12 de la noche');
  });
});

describe('diaHablado', () => {
  it('dice hoy, mañana o el día de la semana', () => {
    expect(diaHablado(new Date(2026, 10, 13, 18), AHORA)).toBe('hoy');
    expect(diaHablado(new Date(2026, 10, 14, 6), AHORA)).toBe('mañana');
    expect(diaHablado(new Date(2026, 10, 17, 6), AHORA)).toBe('el martes');
  });
});

describe('proximaSalida', () => {
  it('toma la más próxima con asientos y venta abierta que no salió', () => {
    const lista = [
      salida('pasada', 8),
      salida('llena', 11, { asientosLibres: 0 }),
      salida('cerrada', 11, { ventaAbierta: false }),
      salida('tarde', 17),
      salida('buena', 13),
    ];
    expect(proximaSalida(lista, AHORA).id).toBe('buena');
  });

  it('devuelve nulo si no queda ninguna', () => {
    expect(proximaSalida([salida('pasada', 8)], AHORA)).toBeNull();
  });
});
