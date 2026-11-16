import { describe, expect, it } from '@jest/globals';

import { MAXIMO_MENSAJE, textoDeMensaje } from './mensajesViaje';

describe('textoDeMensaje', () => {
  it('recorta los bordes y junta los espacios repetidos', () => {
    expect(textoDeMensaje('  ya   voy  en   camino ')).toBe(
      'ya voy en camino',
    );
  });
});
