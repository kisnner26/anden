import { describe, expect, it } from '@jest/globals';

import { MAXIMO_MENSAJE, textoDeMensaje } from './mensajesViaje';

describe('textoDeMensaje', () => {
  it('recorta los bordes y junta los espacios repetidos', () => {
    expect(textoDeMensaje('  ya   voy  en   camino ')).toBe(
      'ya voy en camino',
    );
  });

  it('un texto vacío o solo de espacios no se envía', () => {
    expect(textoDeMensaje('')).toBeNull();
    expect(textoDeMensaje('   ')).toBeNull();
  });

  it('pasado el máximo no se envía y justo en el máximo sí', () => {
    expect(textoDeMensaje('a'.repeat(MAXIMO_MENSAJE))).not.toBeNull();
    expect(textoDeMensaje('a'.repeat(MAXIMO_MENSAJE + 1))).toBeNull();
  });
});
