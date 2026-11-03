import { expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { SelectorFecha } from './SelectorFecha';

it('expone la fecha elegida y permite cambiarla', async () => {
  const alElegir = jest.fn();
  const pantalla = await renderPantalla(
    <SelectorFecha
      alElegir={alElegir}
      dias={[
        { etiqueta: 'Hoy', id: '2026-11-03', numero: '03' },
        { etiqueta: 'Mié', id: '2026-11-04', numero: '04' },
      ]}
      etiqueta="¿Cuándo viajás?"
      seleccionado="2026-11-03"
    />,
  );

  expect(
    pantalla.getByRole('radio', { checked: true, name: 'Hoy 03' }),
  ).toBeTruthy();
  await fireEvent.press(pantalla.getByRole('radio', { name: 'Mié 04' }));
  expect(alElegir).toHaveBeenCalledWith('2026-11-04');
});
