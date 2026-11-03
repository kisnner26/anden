import { describe, expect, it } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

import { DetalleRuta } from './DetalleRuta';

describe('DetalleRuta', () => {
  it('presenta el corredor sin inventar posición ni eta', async () => {
    const pantalla = await renderPantalla(
      <DetalleRuta alVolver={() => undefined} rutaId="cor_boa_man" />,
    );

    expect(
      pantalla.getByRole('header', { name: 'Boaco → Managua' }),
    ).toBeTruthy();
    expect(
      pantalla.getByText('Seguimiento en vivo pendiente de datos operativos'),
    ).toBeTruthy();
    expect(pantalla.queryByText(/km/)).toBeNull();
    expect(pantalla.queryByText(/min/)).toBeNull();
  });

  it('presenta paradas, tarifa de muestra y siguiente salida', async () => {
    const pantalla = await renderPantalla(
      <DetalleRuta alVolver={() => undefined} rutaId="rut_uca_gra" />,
    );

    expect(pantalla.getByText('Paradas del recorrido')).toBeTruthy();
    expect(pantalla.getByText('Terminal UCA')).toBeTruthy();
    expect(pantalla.getAllByText('Tarifas de muestra')).toHaveLength(2);
    expect(pantalla.getByText('Siguiente salida')).toBeTruthy();
  });
});
