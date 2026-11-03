import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { OpcionSeleccion } from './OpcionSeleccion';

describe('OpcionSeleccion', () => {
  it('se anuncia como opción elegida', async () => {
    const pantalla = await render(
      <OpcionSeleccion
        alElegir={() => undefined}
        detalle="Pagás al subir."
        elegida
        nombre="Efectivo"
      />,
    );
    expect(
      pantalla.getByRole('radio', { name: 'Efectivo' }).props
        .accessibilityState,
    ).toEqual({ checked: true, disabled: false });
  });

  it('avisa al elegirla', async () => {
    const alElegir = jest.fn();
    const pantalla = await render(
      <OpcionSeleccion
        alElegir={alElegir}
        detalle="d"
        elegida={false}
        nombre="Efectivo"
      />,
    );
    await fireEvent.press(pantalla.getByRole('radio', { name: 'Efectivo' }));
    expect(alElegir).toHaveBeenCalledTimes(1);
  });

  it('no se puede elegir cuando está deshabilitada y muestra su rótulo', async () => {
    const alElegir = jest.fn();
    const pantalla = await render(
      <OpcionSeleccion
        alElegir={alElegir}
        deshabilitada
        detalle="d"
        elegida={false}
        nombre="Tarjeta"
        rotulo="Próximamente"
      />,
    );
    await fireEvent.press(pantalla.getByRole('radio', { name: 'Tarjeta' }));
    expect(alElegir).not.toHaveBeenCalled();
    expect(pantalla.getByText('Próximamente')).toBeTruthy();
  });
});
