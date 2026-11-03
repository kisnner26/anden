import { describe, expect, it } from '@jest/globals';

import {
  SIN_FILTROS,
  buscarSalidas,
  hayFiltros,
  normalizar,
} from './buscarSalidas';
import type { Salida } from './salidas';

function salida(cambios: Partial<Salida>): Salida {
  return {
    anden: 1,
    asientosLibres: 10,
    choferId: 'cho_1',
    codigoDestino: 'GRA',
    destino: 'Granada',
    estado: 'programado',
    minutosAtraso: 0,
    placa: 'M 123456',
    rutaId: 'rut_1',
    salida: new Date('2026-11-03T08:00:00-06:00'),
    servicio: 'ordinario',
    tarifa: 46,
    ventaAbierta: true,
    viajeId: 'via_1',
    ...cambios,
  };
}

const GRANADA = salida({});
const LEON = salida({
  codigoDestino: 'LEO',
  destino: 'León',
  placa: 'M 654321',
  salida: new Date('2026-11-03T14:30:00-06:00'),
  servicio: 'expreso',
  viajeId: 'via_2',
});
const SALIDAS = [GRANADA, LEON];

describe('normalizar', () => {
  it('quita tildes y pasa a minúsculas', () => {
    expect(normalizar(' León ')).toBe('leon');
  });
});

describe('buscarSalidas', () => {
  it('sin filtros devuelve todas', () => {
    expect(buscarSalidas(SALIDAS, SIN_FILTROS)).toEqual(SALIDAS);
  });

  it('encuentra por destino sin importar tildes ni mayúsculas', () => {
    const encontradas = buscarSalidas(SALIDAS, {
      ...SIN_FILTROS,
      texto: 'LEON',
    });
    expect(encontradas).toEqual([LEON]);
  });

  it('encuentra por una parte del destino', () => {
    expect(buscarSalidas(SALIDAS, { ...SIN_FILTROS, texto: 'gran' })).toEqual([
      GRANADA,
    ]);
  });

  it('encuentra por el código del destino', () => {
    expect(buscarSalidas(SALIDAS, { ...SIN_FILTROS, texto: 'leo' })).toEqual([
      LEON,
    ]);
  });

  it('encuentra por la placa', () => {
    expect(buscarSalidas(SALIDAS, { ...SIN_FILTROS, texto: '654321' })).toEqual(
      [LEON],
    );
  });

  it('filtra por servicio', () => {
    expect(
      buscarSalidas(SALIDAS, { ...SIN_FILTROS, servicio: 'expreso' }),
    ).toEqual([LEON]);
  });

  it('filtra por franja horaria de Managua', () => {
    expect(
      buscarSalidas(SALIDAS, { ...SIN_FILTROS, franja: 'manana' }),
    ).toEqual([GRANADA]);
    expect(buscarSalidas(SALIDAS, { ...SIN_FILTROS, franja: 'tarde' })).toEqual(
      [LEON],
    );
  });

  it('combina texto, servicio y franja', () => {
    const encontradas = buscarSalidas(SALIDAS, {
      franja: 'tarde',
      servicio: 'expreso',
      texto: 'leon',
    });
    expect(encontradas).toEqual([LEON]);
    expect(
      buscarSalidas(SALIDAS, {
        franja: 'manana',
        servicio: 'expreso',
        texto: '',
      }),
    ).toEqual([]);
  });

  it('sin coincidencias devuelve una lista vacía', () => {
    expect(buscarSalidas(SALIDAS, { ...SIN_FILTROS, texto: 'rivas' })).toEqual(
      [],
    );
  });
});

describe('hayFiltros', () => {
  it('es falso sin filtros ni texto', () => {
    expect(hayFiltros(SIN_FILTROS)).toBe(false);
  });

  it('es verdadero con cualquier filtro', () => {
    expect(hayFiltros({ ...SIN_FILTROS, texto: 'a' })).toBe(true);
    expect(hayFiltros({ ...SIN_FILTROS, franja: 'noche' })).toBe(true);
    expect(hayFiltros({ ...SIN_FILTROS, servicio: 'expreso' })).toBe(true);
  });
});
