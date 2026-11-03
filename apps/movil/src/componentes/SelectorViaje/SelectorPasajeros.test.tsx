import { expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { SelectorPasajeros } from './SelectorPasajeros';

it('ajusta la cantidad dentro de sus límites', async () => {
  const alCambiar = jest.fn();
  const pantalla = await renderPantalla(
    <SelectorPasajeros
      alCambiar={alCambiar}
      cantidad={1}
      etiqueta="Pasajeros"
      etiquetaAumentar="Agregar pasajero"
      etiquetaDisminuir="Quitar pasajero"
      maximo={2}
    />,
  );

  expect(
    pantalla.getByRole('button', { name: 'Quitar pasajero' }).props
      .accessibilityState,
  ).toEqual({ disabled: true });
  await fireEvent.press(
    pantalla.getByRole('button', { name: 'Agregar pasajero' }),
  );
  expect(alCambiar).toHaveBeenCalledWith(2);
});
