import { describe, expect, it } from '@jest/globals';

import {
  MEMORIA_VACIA,
  destinoHabitual,
  leerMemoria,
  momentoDelDia,
  momentoHabitual,
  registrarPregunta,
  registrarReserva,
  resumenParaModelo,
} from './memoriaIA';

const AHORA = new Date(2026, 10, 12, 8, 30);

describe('registrarPregunta', () => {
  it('cuenta los destinos mencionados sin importar tildes o mayúsculas', () => {
    const memoria = registrarPregunta(
      MEMORIA_VACIA,
      '¿bus a LEON?',
      ['León', 'Boaco'],
      AHORA,
    );
    expect(memoria.destinos).toEqual({ León: 1 });
    expect(memoria.usos).toBe(1);
    expect(memoria.horas[8]).toBe(1);
  });

  it('guarda las últimas preguntas sin repetir y con un tope', () => {
    let memoria = MEMORIA_VACIA;
    for (let i = 0; i < 12; i += 1) {
      memoria = registrarPregunta(memoria, `pregunta ${i}`, [], AHORA);
    }
    memoria = registrarPregunta(memoria, 'pregunta 5', [], AHORA);
    expect(memoria.preguntas).toHaveLength(8);
    expect(memoria.preguntas[0]).toBe('pregunta 5');
    expect(memoria.preguntas.filter((p) => p === 'pregunta 5')).toHaveLength(1);
  });

  it('no modifica la memoria anterior', () => {
    registrarPregunta(MEMORIA_VACIA, 'hola', [], AHORA);
    expect(MEMORIA_VACIA.usos).toBe(0);
  });
});

describe('destino y momento habituales', () => {
  it('el destino habitual es el más mencionado; una reserva pesa más', () => {
    let memoria = registrarPregunta(
      MEMORIA_VACIA,
      'boaco',
      ['Boaco', 'Juigalpa'],
      AHORA,
    );
    memoria = registrarReserva(memoria, 'Juigalpa');
    expect(destinoHabitual(memoria)).toBe('Juigalpa');
    expect(destinoHabitual(MEMORIA_VACIA)).toBeNull();
  });

  it('el momento habitual necesita unos cuantos usos', () => {
    let memoria = MEMORIA_VACIA;
    for (let i = 0; i < 3; i += 1)
      memoria = registrarPregunta(memoria, 'x', [], AHORA);
    expect(momentoHabitual(memoria)).toBe('manana');
    expect(momentoHabitual(MEMORIA_VACIA)).toBeNull();
    expect(momentoDelDia(22)).toBe('noche');
  });

  it('resume para el modelo solo lo que sabe', () => {
    expect(resumenParaModelo(MEMORIA_VACIA)).toBe('');
    const memoria = registrarReserva(MEMORIA_VACIA, 'Boaco');
    expect(resumenParaModelo(memoria)).toContain('Boaco');
  });
});

describe('leerMemoria', () => {
  it('devuelve vacía con datos rotos', () => {
    expect(leerMemoria('{no es json')).toEqual(MEMORIA_VACIA);
    expect(leerMemoria(null)).toEqual(MEMORIA_VACIA);
  });

  it('descarta lo que no tiene la forma esperada', () => {
    const memoria = leerMemoria(
      JSON.stringify({
        destinos: { Boaco: 'x', León: 2 },
        horas: [1],
        preguntas: [1, 'a'],
        usos: -4,
      }),
    );
    expect(memoria.destinos).toEqual({ León: 2 });
    expect(memoria.horas).toHaveLength(24);
    expect(memoria.preguntas).toEqual(['a']);
    expect(memoria.usos).toBe(0);
  });
});
