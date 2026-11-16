import { describe, expect, it } from '@jest/globals';

import { boletoDePrueba } from '@/pruebas/boletos';

import {
  boletoPorCalificar,
  comentarioDeCalificacion,
  etiquetasRapidas,
  palabraDeNota,
} from './calificarViaje';
import type { Opinion } from './opiniones';

const AHORA = new Date(2026, 10, 14, 12, 0);

describe('etiquetasRapidas', () => {
  it('sin estrellas no hay etiquetas', () => {
    expect(etiquetasRapidas(0)).toEqual([]);
  });

  it('con 4 o 5 estrellas elogian y con menos señalan lo que falló', () => {
    expect(etiquetasRapidas(5)).toContain('Puntual');
    expect(etiquetasRapidas(4)).toContain('Buen manejo');
    expect(etiquetasRapidas(2)).toContain('Llegó tarde');
    expect(etiquetasRapidas(3)).toContain('Manejo brusco');
  });
});

describe('comentarioDeCalificacion', () => {
  it('junta las etiquetas con la frase propia', () => {
    expect(comentarioDeCalificacion(['Puntual', 'Amable'], ' muy bien ')).toBe(
      'Puntual · Amable · muy bien',
    );
  });

  it('sin frase deja solo las etiquetas y sin nada queda vacío', () => {
    expect(comentarioDeCalificacion(['Puntual'], '')).toBe('Puntual');
    expect(comentarioDeCalificacion([], '  ')).toBe('');
  });
});

describe('boletoPorCalificar', () => {
  const base = boletoDePrueba(new Date(2026, 10, 13, 8, 0), 3, 'AAAA1111');
  // otro viaje distinto del de los demás boletos de prueba
  const hecho = { ...base, boleto: { ...base.boleto, viajeId: 'via_1' } };
  const reciente = boletoDePrueba(new Date(2026, 10, 14, 7, 0), 4, 'BBBB2222');
  const futuro = boletoDePrueba(new Date(2026, 10, 15, 7, 0), 5, 'CCCC3333');

  const llegaron = new Set(['via_1', 'via_2']);

  it('elige el viaje ya hecho más reciente que no tiene opinión', () => {
    expect(
      boletoPorCalificar([hecho, reciente, futuro], [], AHORA, llegaron)?.boleto
        .id,
    ).toBe('bol_BBBB2222');
  });

  it('quien reservó y no viajó no recibe el pedido de calificar', () => {
    expect(boletoPorCalificar([hecho, reciente], [], AHORA)).toBeNull();
  });

  it('un viaje de hace más de dos días ya no se pide', () => {
    const viejo = boletoDePrueba(new Date(2026, 10, 10, 8, 0), 6, 'DDDD4444');
    expect(boletoPorCalificar([viejo], [], AHORA)).toBeNull();
  });

  it('un viaje que todavía no sale no se califica', () => {
    expect(boletoPorCalificar([futuro], [], AHORA)).toBeNull();
  });

  it('salta los que ya tienen opinión', () => {
    const opinion: Opinion = {
      boletoId: 'bol_BBBB2222',
      choferId: 'cho_2',
      comentario: '',
      creadaEn: AHORA.toISOString(),
      estrellas: 5,
      id: 'op_1',
    };
    expect(
      boletoPorCalificar([hecho, reciente], [opinion], AHORA, llegaron)?.boleto
        .id,
    ).toBe('bol_AAAA1111');
  });

  it('calificar un boleto del viaje cubre a los demás boletos del mismo viaje', () => {
    const hermano = {
      ...reciente,
      boleto: { ...reciente.boleto, id: 'bol_HERMANO' },
    };
    const opinion: Opinion = {
      boletoId: 'bol_BBBB2222',
      choferId: 'cho_2',
      comentario: '',
      creadaEn: AHORA.toISOString(),
      estrellas: 5,
      id: 'op_1',
    };
    expect(
      boletoPorCalificar([reciente, hermano], [opinion], AHORA, llegaron),
    ).toBeNull();
  });

  it('un boleto usado se puede calificar aunque la hora no haya pasado', () => {
    const usado = {
      ...futuro,
      boleto: { ...futuro.boleto, estado: 'usado' as const },
    };
    expect(boletoPorCalificar([usado], [], AHORA)?.boleto.id).toBe(
      'bol_CCCC3333',
    );
  });

  it('un boleto cancelado no se califica', () => {
    const cancelado = {
      ...hecho,
      boleto: { ...hecho.boleto, estado: 'cancelado' as const },
    };
    expect(boletoPorCalificar([cancelado], [], AHORA)).toBeNull();
  });
});

describe('palabraDeNota', () => {
  it('traduce las estrellas a una palabra', () => {
    expect(palabraDeNota(1)).toBe('Muy mal');
    expect(palabraDeNota(5)).toBe('Excelente');
    expect(palabraDeNota(0)).toBe('');
  });
});
