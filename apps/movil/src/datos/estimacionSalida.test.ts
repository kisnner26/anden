import { describe, expect, it } from '@jest/globals';

import {
  estimarSalida,
  esperaTipica,
  mediana,
  type SalidaRegistrada,
} from './estimacionSalida';

const PUESTO = new Date(2026, 10, 12, 10, 0);
const en = (minutos: number) => new Date(PUESTO.getTime() + minutos * 60_000);

function historial(esperas: number[], rutaId = 'rut_boa'): SalidaRegistrada[] {
  return esperas.map((esperaMin) => ({
    esperaMin,
    horaDeInicio: 10,
    rutaId,
    servicio: 'ordinario',
  }));
}

const BASE = {
  capacidad: 26,
  historial: [] as SalidaRegistrada[],
  ocupados: 0,
  puestoEn: PUESTO,
  rutaId: 'rut_boa',
  servicio: 'ordinario',
};

describe('mediana', () => {
  it('toma el valor del medio', () => {
    expect(mediana([30, 10, 50])).toBe(30);
    expect(mediana([10, 20, 30, 40])).toBe(25);
    expect(mediana([])).toBeNull();
  });
});

describe('esperaTipica', () => {
  it('usa la mediana de los viajes de la misma ruta y servicio', () => {
    expect(
      esperaTipica(historial([30, 50, 40]), 'rut_boa', 'ordinario', 10),
    ).toEqual({
      minutos: 40,
      muestras: 3,
    });
  });

  it('no mezcla otras rutas y sin datos no inventa nada', () => {
    expect(
      esperaTipica(historial([30], 'otra'), 'rut_boa', 'ordinario', 10),
    ).toBeNull();
  });
});

describe('estimarSalida', () => {
  it('sin ventas ni historial no estima', () => {
    expect(estimarSalida({ ...BASE, ahora: en(5) })).toBeNull();
  });

  it('con el bus lleno sale ya', () => {
    const resultado = estimarSalida({ ...BASE, ahora: en(30), ocupados: 26 });
    expect(resultado).toMatchObject({ base: 'lleno', llenado: 1 });
    expect(resultado?.estimada.getTime()).toBe(en(30).getTime());
  });

  it('por el ritmo: a mitad de bus en 30 minutos faltan otros 30', () => {
    const resultado = estimarSalida({ ...BASE, ahora: en(30), ocupados: 13 });
    expect(resultado?.base).toBe('ritmo');
    expect(
      Math.round((resultado!.estimada.getTime() - en(30).getTime()) / 60_000),
    ).toBe(30);
  });

  it('solo con historial usa la espera típica desde que se puso', () => {
    const resultado = estimarSalida({
      ...BASE,
      ahora: en(5),
      historial: historial([40, 40, 40]),
    });
    expect(resultado?.base).toBe('historial');
    expect(resultado?.estimada.getTime()).toBe(en(40).getTime());
    expect(resultado?.confianza).toBe('media');
  });

  it('mezcla ritmo e historial y gana confianza con datos', () => {
    const resultado = estimarSalida({
      ...BASE,
      ahora: en(30),
      historial: historial([40, 40, 40]),
      ocupados: 13,
    });
    expect(resultado?.base).toBe('mixta');
    expect(resultado?.confianza).toBe('alta');
    const minutos = (resultado!.estimada.getTime() - en(30).getTime()) / 60_000;
    expect(minutos).toBeGreaterThan(0);
    expect(minutos).toBeLessThan(30);
  });

  it('nunca estima más de seis horas por delante', () => {
    const resultado = estimarSalida({ ...BASE, ahora: en(600), ocupados: 2 });
    expect(
      resultado!.estimada.getTime() - en(600).getTime(),
    ).toBeLessThanOrEqual(6 * 3_600_000);
  });
});
