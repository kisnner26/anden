import { describe, expect, it } from '@jest/globals';

import { llegadaEstimada, salidasPendientesHacia } from './planificador';
import type { Salida } from './salidas';

function salida(
  destino: string,
  minutos: number,
  estado: Salida['estado'] = 'programado',
  atraso = 0,
): Salida {
  return {
    destino,
    estado,
    minutosAtraso: atraso,
    salida: new Date(2026, 10, 13, 10, minutos),
    viajeId: `${destino}${minutos}`,
  } as unknown as Salida;
}

describe('salidasPendientesHacia', () => {
  it('deja solo las de ese destino que no han partido, en orden', () => {
    const lista = salidasPendientesHacia(
      [
        salida('Boaco', 40),
        salida('Juigalpa', 5),
        salida('Boaco', 10),
        salida('Boaco', 1, 'en-ruta'),
        salida('Boaco', 2, 'cancelado'),
      ],
      'Boaco',
    );
    expect(lista.map((s) => s.viajeId)).toEqual(['Boaco10', 'Boaco40']);
  });

  it('ordena por la hora real, con el atraso incluido', () => {
    const lista = salidasPendientesHacia(
      [salida('Boaco', 10, 'atrasado', 45), salida('Boaco', 30)],
      'Boaco',
    );
    expect(lista.map((s) => s.viajeId)).toEqual(['Boaco30', 'Boaco10']);
  });
});

describe('llegadaEstimada', () => {
  it('suma la duración estimada a la salida', () => {
    const llegada = llegadaEstimada(salida('Boaco', 0), 79);
    expect(llegada.getHours()).toBe(11);
    expect(llegada.getMinutes()).toBe(19);
  });

  it('cuenta el atraso', () => {
    const llegada = llegadaEstimada(salida('Boaco', 0, 'atrasado', 10), 60);
    expect(llegada.getHours()).toBe(11);
    expect(llegada.getMinutes()).toBe(10);
  });
});
