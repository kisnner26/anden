import { describe, expect, it } from '@jest/globals';

import {
  intercambiarPuntos,
  marcarPunto,
  resumenDelTramo,
  SIN_PUNTOS,
} from './rutaManual';

const MANAGUA = { lat: 12.136, lng: -86.251 };
const BOACO = { lat: 12.472, lng: -85.659 };

describe('marcarPunto', () => {
  it('el primer toque marca A, el segundo B y el tercero empieza de nuevo', () => {
    const uno = marcarPunto(SIN_PUNTOS, MANAGUA);
    expect(uno).toEqual({ a: MANAGUA, b: null });
    const dos = marcarPunto(uno, BOACO);
    expect(dos).toEqual({ a: MANAGUA, b: BOACO });
    const tres = marcarPunto(dos, { lat: 1, lng: 2 });
    expect(tres).toEqual({ a: { lat: 1, lng: 2 }, b: null });
  });
});

describe('intercambiarPuntos', () => {
  it('cambia A por B', () => {
    expect(intercambiarPuntos({ a: MANAGUA, b: BOACO })).toEqual({
      a: BOACO,
      b: MANAGUA,
    });
  });
});

describe('resumenDelTramo', () => {
  it('sin los dos puntos no hay tramo', () => {
    expect(resumenDelTramo({ a: MANAGUA, b: null })).toBeNull();
  });

  it('da kilómetros y minutos razonables entre Managua y Boaco', () => {
    const r = resumenDelTramo({ a: MANAGUA, b: BOACO })!;
    expect(r.km).toBeGreaterThan(60);
    expect(r.km).toBeLessThan(100);
    expect(r.minutos).toBeGreaterThan(60);
  });

  it('dos puntos casi iguales dan al menos un minuto', () => {
    expect(resumenDelTramo({ a: MANAGUA, b: MANAGUA })!.minutos).toBe(1);
  });
});
