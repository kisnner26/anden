import { expect, it } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

import { ProgresoReserva } from './ProgresoReserva';

it('anuncia el paso actual y el total del recorrido', async () => {
  const pantalla = await renderPantalla(<ProgresoReserva paso={2} />);
  const progreso = pantalla.getByRole('progressbar', {
    name: 'Paso 2 de 3: Pasajeros',
  });

  expect(progreso.props.accessibilityValue).toEqual({
    max: 3,
    min: 1,
    now: 2,
  });
  expect(pantalla.getByText('2/3')).toBeTruthy();
  expect(pantalla.getByText('Pasajeros')).toBeTruthy();
});
