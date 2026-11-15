import { describe, expect, it } from '@jest/globals';

import { asientosJuntos, enlaceDeGrupo, mensajeDeGrupo } from './grupo';

describe('enlaceDeGrupo', () => {
  it('arma el enlace en mayúsculas', () => {
    expect(enlaceDeGrupo(' ab12cd34 ')).toBe('anden://grupo/AB12CD34');
  });
});

describe('mensajeDeGrupo', () => {
  it('dice a dónde, a qué hora, cuántos y el enlace', () => {
    const m = mensajeDeGrupo({
      codigo: 'AB12CD34',
      cupo: 4,
      destino: 'Boaco',
      hora: '6:00 a. m.',
    });
    expect(m).toContain('Boaco');
    expect(m).toContain('6:00 a. m.');
    expect(m).toContain('anden://grupo/AB12CD34');
  });
});

describe('asientosJuntos', () => {
  // micro15: filas de 'AA.A': asientos 1,2 | 3 en la primera fila de asientos; 4,5 | 6 en la siguiente
  const TODOS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  it('sin asientos del grupo no sugiere nada', () => {
    expect(asientosJuntos('micro15', TODOS, [])).toEqual([]);
  });

  it('sugiere el de al lado primero y después el de adelante y atrás', () => {
    const libres = new Set([...TODOS].filter((n) => n !== 4));
    const s = asientosJuntos('micro15', libres, [4]);
    expect(s[0]).toBe(5);
    expect(s).toContain(1);
    expect(s).toContain(7);
  });

  it('no cruza el pasillo ni sugiere asientos ocupados', () => {
    // el 2 es del grupo; el 3 está al otro lado del pasillo y el 1 está ocupado
    expect(asientosJuntos('micro15', new Set([3]), [2])).toEqual([]);
    expect(asientosJuntos('micro15', new Set([2]), [3])).toEqual([]);
  });

  it('no repite los asientos del grupo', () => {
    const s = asientosJuntos('micro15', TODOS, [4, 5]);
    expect(s).not.toContain(4);
    expect(s).not.toContain(5);
  });
});
