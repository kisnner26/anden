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
    puntoEncuentro: '764M4PPX+HC',
    asientosLibres: 10,
    choferId: 'cho_1',
    codigoDestino: 'BOA',
    destino: 'Boaco',
    estado: 'programado',
    minutosAtraso: 0,
    origen: 'Managua',
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

const BOACO = salida({});
const JUIGALPA = salida({
  codigoDestino: 'JUI',
  destino: 'Juigalpa',
  placa: 'M 654321',
  salida: new Date('2026-11-03T14:30:00-06:00'),
  servicio: 'expreso',
  viajeId: 'via_2',
});
const SALIDAS = [BOACO, JUIGALPA];

describe('normalizar', () => {
  it('quita tildes y pasa a minúsculas', () => {
    expect(normalizar(' Juigalpa ')).toBe('juigalpa');
  });
});

describe('buscarSalidas', () => {
  it('sin filtros devuelve todas', () => {
    expect(buscarSalidas(SALIDAS, SIN_FILTROS)).toEqual(SALIDAS);
  });

  it('encuentra por destino sin importar tildes ni mayúsculas', () => {
    const encontradas = buscarSalidas(SALIDAS, {
      ...SIN_FILTROS,
      texto: 'JUIGALPA',
    });
    expect(encontradas).toEqual([JUIGALPA]);
  });

  it('encuentra por una parte del destino', () => {
    expect(buscarSalidas(SALIDAS, { ...SIN_FILTROS, texto: 'boa' })).toEqual([
      BOACO,
    ]);
  });

  it('encuentra por el código del destino', () => {
    expect(buscarSalidas(SALIDAS, { ...SIN_FILTROS, texto: 'jui' })).toEqual([
      JUIGALPA,
    ]);
  });

  it('encuentra por la placa', () => {
    expect(buscarSalidas(SALIDAS, { ...SIN_FILTROS, texto: '654321' })).toEqual(
      [JUIGALPA],
    );
  });

  it('filtra por servicio', () => {
    expect(
      buscarSalidas(SALIDAS, { ...SIN_FILTROS, servicio: 'expreso' }),
    ).toEqual([JUIGALPA]);
  });

  it('filtra por franja horaria de Managua', () => {
    expect(
      buscarSalidas(SALIDAS, { ...SIN_FILTROS, franja: 'manana' }),
    ).toEqual([BOACO]);
    expect(buscarSalidas(SALIDAS, { ...SIN_FILTROS, franja: 'tarde' })).toEqual(
      [JUIGALPA],
    );
  });

  it('combina texto, servicio y franja', () => {
    const encontradas = buscarSalidas(SALIDAS, {
      franja: 'tarde',
      servicio: 'expreso',
      texto: 'juigalpa',
    });
    expect(encontradas).toEqual([JUIGALPA]);
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
