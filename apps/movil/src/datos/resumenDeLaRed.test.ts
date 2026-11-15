import { describe, expect, it } from '@jest/globals';

import { resumenDeLaRed } from './resumenDeLaRed';
import type { Salida } from './salidas';

const AHORA = new Date(2026, 10, 15, 10, 0);

function salida(
  origen: string,
  destino: string,
  dia: number,
  hora: number,
  libres = 10,
  estado = 'programado',
): Salida {
  return {
    asientosLibres: libres,
    destino,
    estado,
    origen,
    salida: new Date(2026, 10, dia, hora, 0),
    viajeId: `${origen}-${destino}-${dia}-${hora}`,
  } as unknown as Salida;
}

describe('resumenDeLaRed', () => {
  it('da un tramo por ciudad aunque no haya salidas', () => {
    const r = resumenDeLaRed([], AHORA);
    expect(r.map((t) => t.ciudad)).toEqual(['Boaco', 'Juigalpa']);
    expect(r[0]).toMatchObject({ proxima: null, salidasHoy: 0 });
  });

  it('la próxima salida cuenta los dos sentidos', () => {
    const r = resumenDeLaRed(
      [salida('Managua', 'Boaco', 15, 15), salida('Boaco', 'Managua', 15, 12)],
      AHORA,
    );
    expect(r[0]?.proxima?.getHours()).toBe(12);
    expect(r[0]?.salidasHoy).toBe(2);
  });

  it('dice cuántos asientos le quedan a la próxima', () => {
    const r = resumenDeLaRed([salida('Managua', 'Juigalpa', 15, 14, 7)], AHORA);
    expect(r[1]?.libresEnLaProxima).toBe(7);
  });

  it('no cuenta lo que ya salió ni lo cancelado', () => {
    const r = resumenDeLaRed(
      [
        salida('Managua', 'Boaco', 15, 8),
        salida('Managua', 'Boaco', 15, 16, 10, 'cancelado'),
      ],
      AHORA,
    );
    expect(r[0]?.proxima).toBeNull();
  });

  it('las salidas de otro día no suman a hoy pero sí cuentan como próxima', () => {
    const r = resumenDeLaRed([salida('Managua', 'Boaco', 16, 6)], AHORA);
    expect(r[0]?.salidasHoy).toBe(0);
    expect(r[0]?.proxima?.getDate()).toBe(16);
  });
});
