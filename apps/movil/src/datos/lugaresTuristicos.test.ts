import { describe, expect, it } from '@jest/globals';

import {
  hechosDeLugares,
  lugaresParaPregunta,
  pideSoloFotos,
  textoDeFotos,
} from './lugaresTuristicos';

describe('lugaresParaPregunta', () => {
  it('con una ciudad devuelve todos sus lugares', () => {
    const l = lugaresParaPregunta('quiero ver lugares turísticos de Boaco');
    expect(l).toHaveLength(4);
    expect(new Set(l.map((x) => x.ciudad))).toEqual(new Set(['Boaco']));
  });
  it('pone primero lo que nombra', () => {
    const l = lugaresParaPregunta('mostrame el mirador de Boaco');
    expect(l[0]?.titulo).toBe('Mirador de Boaco');
  });
  it('sin ciudad da uno por ciudad', () => {
    const l = lugaresParaPregunta('fotos de lugares turísticos');
    expect(l.map((x) => x.ciudad).sort()).toEqual([
      'Boaco',
      'Juigalpa',
      'Managua',
    ]);
  });
  it('no muestra fotos si no las pide', () => {
    expect(lugaresParaPregunta('a qué hora sale el bus a Boaco')).toEqual([]);
  });
  it('ver mis boletos no trae fotos', () => {
    expect(lugaresParaPregunta('quiero ver mis boletos')).toEqual([]);
  });
  it('los hechos listan los lugares para el modelo', () => {
    const h = hechosDeLugares(lugaresParaPregunta('qué ver en Juigalpa'));
    expect(h.join('\n')).toContain('Museo Arqueológico de Juigalpa');
  });
});

describe('pideSoloFotos', () => {
  it('solo fotos se contesta sin el modelo', () => {
    expect(pideSoloFotos('fotos de lugares turisticos')).toBe(true);
    expect(pideSoloFotos('quiero ver lugares turísticos de Boaco')).toBe(true);
  });
  it('si pide recomendación o buses va al modelo', () => {
    expect(pideSoloFotos('recomendame qué visitar en Boaco')).toBe(false);
    expect(pideSoloFotos('fotos de Boaco y cuánto cuesta el bus')).toBe(false);
  });
  it('presenta las fotos con una frase corta', () => {
    expect(textoDeFotos(lugaresParaPregunta('fotos de Boaco'))).toBe(
      'Lugares para ver en Boaco.',
    );
  });
});
