import { describe, expect, it } from '@jest/globals';

import { fichaDeCiudad, textoDeFicha } from './fichasCiudad';
import { fotoDeDestino } from './fotosDestino';

describe('fichaDeCiudad', () => {
  it('la encuentra sin importar tildes ni mayúsculas', () => {
    expect(fichaDeCiudad('  BOACO ')?.ciudad).toBe('Boaco');
  });

  it('devuelve null para una ciudad sin ficha', () => {
    expect(fichaDeCiudad('Granada')).toBeNull();
  });

  it('todas las ciudades con ficha tienen foto', () => {
    for (const nombre of ['Managua', 'Boaco', 'Juigalpa']) {
      expect(fotoDeDestino(nombre)).not.toBeNull();
    }
  });

  it('resume la ficha en una línea con sus lugares', () => {
    const ficha = fichaDeCiudad('Managua')!;
    const texto = textoDeFicha(ficha);
    expect(texto).toContain('Managua:');
    expect(texto).toContain('Para visitar:');
    expect(texto.split('\n')).toHaveLength(1);
  });
});
