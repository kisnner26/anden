import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import {
  CLAVE_OBJETOS,
  descripcionValida,
  guardarObjeto,
  leerObjetos,
  MAXIMO_DESCRIPCION,
  nuevoObjeto,
  objetosDeBoleto,
} from './objetosOlvidados';

const DATOS = { boletoId: 'bol_1', destino: 'Boaco', viajeId: 'via_1' };

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('descripcionValida', () => {
  it('pide al menos unas letras y no más del máximo', () => {
    expect(descripcionValida('')).toBe(false);
    expect(descripcionValida('  ab ')).toBe(false);
    expect(descripcionValida('mochila azul')).toBe(true);
    expect(descripcionValida('a'.repeat(MAXIMO_DESCRIPCION))).toBe(true);
    expect(descripcionValida('a'.repeat(MAXIMO_DESCRIPCION + 1))).toBe(false);
  });
});

describe('nuevoObjeto y objetosDeBoleto', () => {
  it('recorta la descripción y toma la fecha dada', () => {
    const objeto = nuevoObjeto(
      DATOS,
      '  mochila azul ',
      new Date('2026-11-12T18:00:00.000Z'),
    );
    expect(objeto.descripcion).toBe('mochila azul');
    expect(objeto.creadoEn).toBe('2026-11-12T18:00:00.000Z');
  });

  it('filtra por boleto y deja el más nuevo primero', () => {
    const viejo = nuevoObjeto(
      DATOS,
      'paraguas',
      new Date('2026-11-12T10:00:00.000Z'),
    );
    const nuevo = nuevoObjeto(
      DATOS,
      'mochila',
      new Date('2026-11-12T12:00:00.000Z'),
    );
    const otro = nuevoObjeto(
      { ...DATOS, boletoId: 'bol_2' },
      'gorra',
      new Date(),
    );
    expect(
      objetosDeBoleto([viejo, otro, nuevo], 'bol_1').map((o) => o.descripcion),
    ).toEqual(['mochila', 'paraguas']);
  });
});

describe('guardado', () => {
  it('guarda sin perder los anteriores', async () => {
    await guardarObjeto(nuevoObjeto(DATOS, 'mochila', new Date(1)));
    const lista = await guardarObjeto(
      nuevoObjeto(DATOS, 'paraguas', new Date(2)),
    );
    expect(lista).toHaveLength(2);
    expect(await leerObjetos()).toHaveLength(2);
  });

  it('tolera datos dañados', async () => {
    await AsyncStorage.setItem(CLAVE_OBJETOS, 'no es json');
    expect(await leerObjetos()).toEqual([]);
    await AsyncStorage.setItem(CLAVE_OBJETOS, JSON.stringify([{ id: 'x' }]));
    expect(await leerObjetos()).toEqual([]);
  });
});
