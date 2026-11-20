import { describe, expect, it } from '@jest/globals';

import { rotuloDelServicio, trayectoImpreso } from './boletoDePapel';

describe('rotuloDelServicio', () => {
  it('el expreso se rotula como expreso interlocal', () => {
    expect(rotuloDelServicio('expreso')).toBe('Expreso interlocal');
  });

  it('el ordinario se rotula como ordinario interlocal', () => {
    expect(rotuloDelServicio('ordinario')).toBe('Ordinario interlocal');
  });
});

describe('trayectoImpreso', () => {
  it('une origen y destino en mayúsculas con raya', () => {
    expect(trayectoImpreso('Boaco', 'Managua')).toBe('BOACO–MANAGUA');
  });

  it('sin origen deja solo el destino', () => {
    expect(trayectoImpreso(undefined, 'Boaco')).toBe('BOACO');
  });

  it('recorta los espacios de los extremos', () => {
    expect(trayectoImpreso(' Managua ', ' Juigalpa ')).toBe('MANAGUA–JUIGALPA');
  });
});
