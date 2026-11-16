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
});
