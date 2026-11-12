import { describe, expect, it } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

import { LineaViaje } from './LineaViaje';

describe('LineaViaje', () => {
  it('muestra las dos horas con su sufijo y el código de cada terminal', async () => {
    const pantalla = await renderPantalla(
      <LineaViaje
        destinoCodigo="JUI"
        llegada={new Date(2026, 10, 12, 15, 26)}
        origenCodigo="MAY"
        salida={new Date(2026, 10, 12, 12, 56)}
      />,
    );
    expect(pantalla.getByText('12:56')).toBeTruthy();
    expect(pantalla.getByText('3:26')).toBeTruthy();
    expect(pantalla.getAllByText('p. m.')).toHaveLength(2);
    expect(pantalla.getByText('MAY')).toBeTruthy();
    expect(pantalla.getByText('JUI')).toBeTruthy();
    expect(pantalla.getByText('Sale')).toBeTruthy();
    expect(pantalla.getByText('Llega (ETA)')).toBeTruthy();
  });
});
