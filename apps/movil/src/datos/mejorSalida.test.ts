import { describe, expect, it } from '@jest/globals';

import { esTomable, mejorSalida } from './mejorSalida';
import type { Salida } from './salidas';

// viernes 13 de noviembre de 2026, 10:00
const AHORA = new Date(2026, 10, 13, 10, 0);

function salida(id: string, hora: number, extra: Partial<Salida> = {}): Salida {
  return {
    asientosLibres: 12,
    choferId: 'cho_1',
    codigoDestino: 'BOA',
    destino: 'Boaco',
    estado: 'programado',
    minutosAtraso: 0,
    origen: 'Managua',
    placa: 'M 123-456',
    puntoEncuentro: '764M4PPX+HH',
    rutaId: 'rut_1',
    salida: new Date(2026, 10, 13, hora, 0),
    servicio: 'ordinario',
    tarifa: 46,
    ventaAbierta: true,
    viajeId: id,
    ...extra,
  };
}

describe('esTomable', () => {
  it('descarta la que sale sin margen para llegar', () => {
    expect(esTomable(salida('a', 10, { minutosAtraso: 5 }), AHORA)).toBe(false);
    expect(esTomable(salida('b', 11), AHORA)).toBe(true);
  });

  it('descarta venta cerrada, sin asientos y canceladas', () => {
    expect(esTomable(salida('a', 12, { ventaAbierta: false }), AHORA)).toBe(
      false,
    );
    expect(esTomable(salida('b', 12, { asientosLibres: 0 }), AHORA)).toBe(
      false,
    );
    expect(esTomable(salida('c', 12, { estado: 'cancelado' }), AHORA)).toBe(
      false,
    );
  });
});

describe('mejorSalida', () => {
  it('no elige nada si no hay una salida tomable', () => {
    expect(mejorSalida([salida('a', 9)], { ahora: AHORA })).toBeNull();
  });

  it('prefiere la que sale pronto entre salidas iguales', () => {
    const elegida = mejorSalida([salida('tarde', 15), salida('pronto', 11)], {
      ahora: AHORA,
    });
    expect(elegida?.salida.viajeId).toBe('pronto');
  });






});
