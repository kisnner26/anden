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
});

describe('etiquetasDe', () => {
  it('ordena las etiquetas y no repite', () => {
    expect(etiquetasDe(FRASES)).toEqual(['precio', 'saludo']);
  });
});
