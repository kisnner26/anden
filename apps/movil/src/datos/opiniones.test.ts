import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, describe, expect, it } from '@jest/globals';

import {
  boletoParaOpinar,
  guardarOpinion,
  guardarReporte,
  leerOpiniones,
  leerReportes,
  notaConOpiniones,
  opinionesDe,
  opinionValida,
  type Opinion,
} from './opiniones';

afterEach(async () => {
  await AsyncStorage.clear();
});

describe('opinionValida', () => {
  it('acepta de 1 a 5 estrellas', () => {
    expect(opinionValida(1, '')).toBe(true);
    expect(opinionValida(5, 'Buen viaje')).toBe(true);
  });

  it('rechaza estrellas fuera de rango o decimales', () => {
    expect(opinionValida(0, '')).toBe(false);
    expect(opinionValida(6, '')).toBe(false);
    expect(opinionValida(3.5, '')).toBe(false);
  });

  it('rechaza un comentario de más de 280 letras', () => {
    expect(opinionValida(4, 'a'.repeat(281))).toBe(false);
    expect(opinionValida(4, 'a'.repeat(280))).toBe(true);
  });
});

describe('guardar y leer opiniones', () => {
  it('guarda con el comentario recortado y la fecha', async () => {
    const lista = await guardarOpinion(
      { choferId: 'cho_1', comentario: '  Muy amable  ', estrellas: 5 },
      new Date('2026-11-12T10:00:00Z'),
    );
    expect(lista).toHaveLength(1);
    expect(lista[0]?.comentario).toBe('Muy amable');
    expect(await leerOpiniones()).toEqual(lista);
  });

  it('ordena las de un chofer de la más nueva a la más vieja', async () => {
    await guardarOpinion(
      { choferId: 'cho_1', comentario: 'vieja', estrellas: 3 },
      new Date('2026-11-10T10:00:00Z'),
    );
    await guardarOpinion(
      { choferId: 'cho_2', comentario: 'otro', estrellas: 4 },
      new Date('2026-11-11T10:00:00Z'),
    );
    const lista = await guardarOpinion(
      { choferId: 'cho_1', comentario: 'nueva', estrellas: 5 },
      new Date('2026-11-12T10:00:00Z'),
    );
    expect(opinionesDe(lista, 'cho_1').map((o) => o.comentario)).toEqual([
      'nueva',
      'vieja',
    ]);
  });
});

describe('reportes', () => {
  it('guarda el motivo del reporte', async () => {
    await guardarReporte('cho_1', 'maltrato', new Date('2026-11-12T10:00:00Z'));
    expect(await leerReportes()).toEqual([
      {
        choferId: 'cho_1',
        creadoEn: '2026-11-12T10:00:00.000Z',
        motivo: 'maltrato',
      },
    ]);
  });
});

describe('boletoParaOpinar', () => {
  const viajes = [
    { choferId: 'cho_1', id: 'via_1', salida: '2026-11-12T10:00:00Z' },
    { choferId: 'cho_2', id: 'via_2', salida: '2026-11-12T10:00:00Z' },
    { choferId: 'cho_1', id: 'via_3', salida: '2026-11-12T20:00:00Z' },
  ];
  const ahora = new Date('2026-11-12T12:00:00Z');
  const boleto = (id: string, viajeId: string, estado = 'vigente') => ({
    estado,
    id,
    viajeId,
  });

  it('devuelve el boleto de un viaje del chofer que ya salió', () => {
    expect(
      boletoParaOpinar([boleto('b1', 'via_1')], viajes, 'cho_1', [], ahora),
    ).toBe('b1');
  });

  it('no sirve un viaje de otro chofer, uno que no salió ni uno cancelado', () => {
    const boletos = [
      boleto('b2', 'via_2'),
      boleto('b3', 'via_3'),
      boleto('b4', 'via_1', 'cancelado'),
    ];
    expect(boletoParaOpinar(boletos, viajes, 'cho_1', [], ahora)).toBeNull();
  });

  it('una opinión por boleto', () => {
    const previa = { boletoId: 'b1' } as Opinion;
    expect(
      boletoParaOpinar(
        [boleto('b1', 'via_1')],
        viajes,
        'cho_1',
        [previa],
        ahora,
      ),
    ).toBeNull();
  });
});

describe('notaConOpiniones', () => {
  const opinion = (estrellas: 1 | 2 | 3 | 4 | 5) => ({ estrellas }) as Opinion;

  it('mezcla las opiniones propias con la nota del chofer', () => {
    expect(notaConOpiniones({ promedio: 4, total: 4 }, [opinion(5)])).toEqual({
      promedio: 4.2,
      total: 5,
    });
  });

  it('sin nota base muestra nota desde cinco opiniones', () => {
    expect(
      notaConOpiniones({ promedio: null, total: 2 }, [opinion(5)]),
    ).toEqual({ promedio: null, total: 3 });
    expect(
      notaConOpiniones(
        { promedio: null, total: 0 },
        [5, 4, 5, 4, 5].map((n) => opinion(n as 4)),
      ).promedio,
    ).toBe(4.6);
  });

  it('sin opiniones propias deja la nota igual', () => {
    expect(notaConOpiniones({ promedio: 4.5, total: 10 }, [])).toEqual({
      promedio: 4.5,
      total: 10,
    });
  });
});
