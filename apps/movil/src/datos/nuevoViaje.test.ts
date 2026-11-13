import { describe, expect, it } from '@jest/globals';

import {
  armarFilaViaje,
  fechaDeSalida,
  idDeViaje,
  leerHora,
  validarViaje,
  type BorradorViaje,
} from './nuevoViaje';

const AHORA = new Date(2026, 10, 12, 10, 0);

const BUENO: BorradorViaje = {
  anden: '4',
  dia: new Date(2026, 10, 12),
  hora: '14:30',
  placa: 'M 123-456',
  rutaId: 'rut_may_boa',
  servicio: 'ordinario',
};

describe('leerHora', () => {
  it('acepta 24 horas con o sin cero adelante', () => {
    expect(leerHora('14:30')).toEqual({ horas: 14, minutos: 30 });
    expect(leerHora('5:05')).toEqual({ horas: 5, minutos: 5 });
  });

  it('rechaza lo que no es una hora', () => {
    expect(leerHora('25:00')).toBeNull();
    expect(leerHora('14:61')).toBeNull();
    expect(leerHora('hola')).toBeNull();
  });
});

describe('validarViaje', () => {
  it('un viaje completo y a futuro no tiene errores', () => {
    expect(validarViaje(BUENO, AHORA)).toEqual([]);
  });

  it('pide ruta, placa, andén y hora', () => {
    const errores = validarViaje(
      { ...BUENO, anden: '0', hora: 'x', placa: '', rutaId: null },
      AHORA,
    );
    expect(errores).toEqual(
      expect.arrayContaining(['anden', 'hora', 'placa', 'ruta']),
    );
  });

  it('no deja publicar una salida que ya pasó', () => {
    expect(validarViaje({ ...BUENO, hora: '09:00' }, AHORA)).toContain(
      'pasado',
    );
  });
});

describe('armarFilaViaje', () => {
  it('arma la fila con la placa en mayúsculas y la hora del día elegido', () => {
    const fila = armarFilaViaje(
      { ...BUENO, placa: 'm 123-456' },
      'cho_1',
      AHORA,
      () => 0.5,
    );
    expect(fila).toMatchObject({
      anden: 4,
      chofer_id: 'cho_1',
      placa: 'M 123-456',
      ruta_id: 'rut_may_boa',
      servicio: 'ordinario',
    });
    expect(new Date(fila?.salida ?? '').getHours()).toBe(14);
  });

  it('sin ruta o con hora mala no arma nada', () => {
    expect(
      armarFilaViaje({ ...BUENO, rutaId: null }, 'cho_1', AHORA),
    ).toBeNull();
    expect(armarFilaViaje({ ...BUENO, hora: 'x' }, 'cho_1', AHORA)).toBeNull();
    expect(fechaDeSalida({ ...BUENO, hora: 'x' })).toBeNull();
  });
});

describe('idDeViaje', () => {
  it('empieza con via_ y cambia con el azar', () => {
    expect(idDeViaje(AHORA, () => 0.1)).toMatch(/^via_/);
    expect(idDeViaje(AHORA, () => 0.1)).not.toBe(idDeViaje(AHORA, () => 0.9));
  });
});
