import { describe, expect, it } from 'vitest';

import { precioOficial } from './precio';
import type { Tarifario } from './tipos';

const tarifario: Tarifario = [
  {
    rutaId: 'rut_uca_gra',
    servicio: 'ordinario',
    desdeParada: 0,
    hastaParada: 2,
    cordobas: 46,
    resolucion: 'muestra',
  },
  {
    rutaId: 'rut_uca_gra',
    servicio: 'ordinario',
    desdeParada: 1,
    hastaParada: 2,
    cordobas: 21,
    resolucion: 'muestra',
  },
];

const pasajero = { nombre: 'Ana Ruiz', esMenorEnBrazos: false };

describe('precioOficial', () => {
  it('devuelve la tarifa exacta del recorrido completo', () => {
    expect(
      precioOficial(
        tarifario,
        'rut_uca_gra',
        'ordinario',
        { desde: 0, hasta: 2 },
        [pasajero],
      ),
    ).toEqual({ ok: true, valor: { unitario: 46, total: 46 } });
  });
});
