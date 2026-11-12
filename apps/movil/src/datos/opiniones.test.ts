import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, describe, expect, it } from '@jest/globals';

import {
  guardarOpinion,
  guardarReporte,
  leerOpiniones,
  leerReportes,
  opinionesDe,
  opinionValida,
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
