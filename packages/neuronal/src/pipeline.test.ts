import { describe, expect, it } from 'vitest';

import { Clasificador } from './clasificador.ts';
import { entrenarClasificador, etiquetasDe, type Frase } from './pipeline.ts';

const FRASES: Frase[] = [
  ...[
    'cuanto cuesta el boleto',
    'precio del pasaje',
    'tarifa a boaco',
    'cuanto vale ir a juigalpa',
    'costo del bus',
    'cuanto cobran por viajar',
  ].map((texto) => ({ etiqueta: 'precio', texto })),
  ...[
    'hola',
    'buenas',
    'buenos dias',
    'buenas tardes',
    'que tal',
    'saludos',
  ].map((texto) => ({ etiqueta: 'saludo', texto })),
];

describe('entrenarClasificador', () => {
  it('aprende a separar dos intenciones simples', () => {
    const r = entrenarClasificador(FRASES, {
      dimension: 128,
      epocas: 60,
      ocultas: [8],
      validacion: 0,
    });
    const c = new Clasificador(r.modelo);
    expect(c.mejor('cuanto cuesta el pasaje', 0.5)?.etiqueta).toBe('precio');
    expect(c.mejor('buenas noches', 0.5)?.etiqueta).toBe('saludo');
  });

  it('devuelve el modelo con las etiquetas y la cantidad de ejemplos', () => {
    const r = entrenarClasificador(FRASES, {
      dimension: 64,
      epocas: 3,
      ocultas: [4],
    });
    expect(r.modelo.etiquetas).toEqual(['precio', 'saludo']);
    expect(r.modelo.meta.ejemplos).toBe(12);
  });

  it('devuelve la matriz de confusión con una fila por intención', () => {
    const r = entrenarClasificador(FRASES, {
      dimension: 64,
      epocas: 3,
      ocultas: [4],
    });
    expect(r.matriz).toHaveLength(2);
    expect(r.matriz[0]).toHaveLength(2);
  });

  it('cuenta los parámetros de la red', () => {
    const r = entrenarClasificador(FRASES, {
      dimension: 64,
      epocas: 1,
      ocultas: [4],
    });
    expect(r.parametros).toBe(64 * 4 + 4 + 4 * 2 + 2);
  });
});

describe('etiquetasDe', () => {
  it('ordena las etiquetas y no repite', () => {
    expect(etiquetasDe(FRASES)).toEqual(['precio', 'saludo']);
  });
});

describe('Clasificador', () => {
  it('ordena las intenciones de la más a la menos probable', () => {
    const c = new Clasificador(
      entrenarClasificador(FRASES, {
        dimension: 64,
        epocas: 5,
        ocultas: [4],
        validacion: 0,
      }).modelo,
    );
    const p = c.clasificar('hola');
    expect(p[0]!.probabilidad).toBeGreaterThanOrEqual(p[1]!.probabilidad);
    expect(p).toHaveLength(2);
  });

  it('calla si no está lo bastante seguro', () => {
    const c = new Clasificador(
      entrenarClasificador(FRASES, {
        dimension: 64,
        epocas: 1,
        ocultas: [4],
        validacion: 0,
      }).modelo,
    );
    expect(c.mejor('xyzzy', 0.999)).toBeNull();
  });
});
