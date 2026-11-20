import { describe, expect, it } from '@jest/globals';

import {
  contactoDeCooperativa,
  rotuloDelServicio,
  trayectoImpreso,
} from './boletoDePapel';

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

describe('contactoDeCooperativa', () => {
  it('trae un teléfono de cada operador', () => {
    const operadores = contactoDeCooperativa(
      'Cooperativa de muestra',
    ).telefonos.map((telefono) => telefono.operador);
    expect(operadores).toEqual(['Claro', 'Tigo']);
  });

  it('los teléfonos tienen formato de ocho dígitos con guion', () => {
    for (const { numero } of contactoDeCooperativa('x').telefonos) {
      expect(numero).toMatch(/^\d{4}-\d{4}$/);
    }
  });

  it('trae leyendas y un cierre', () => {
    const contacto = contactoDeCooperativa('x');
    expect(contacto.leyendas.length).toBeGreaterThan(0);
    expect(contacto.cierre).not.toBe('');
  });
});
