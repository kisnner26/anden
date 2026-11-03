import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Hoja } from './Hoja';

describe('Hoja', () => {
  it('no expone el contenido cuando está cerrada', async () => {
    const pantalla = await render(
      <Hoja
        abierta={false}
        alCerrar={() => undefined}
        etiquetaCerrar="Cerrar detalle"
      >
        <Text>Detalle del viaje</Text>
      </Hoja>,
    );

    expect(pantalla.queryByText('Detalle del viaje')).toBeNull();
  });

  it('muestra el contenido y se puede cerrar desde el fondo', async () => {
    const alCerrar = jest.fn();
    const pantalla = await render(
      <Hoja abierta alCerrar={alCerrar} etiquetaCerrar="Cerrar detalle">
        <Text>Detalle del viaje</Text>
      </Hoja>,
    );

    expect(pantalla.getByText('Detalle del viaje')).toBeTruthy();
    await fireEvent.press(
      pantalla.getAllByRole('button', { name: 'Cerrar detalle' })[0] as never,
    );
    expect(alCerrar).toHaveBeenCalledTimes(1);
  });

  it('etiqueta el asa que cierra la hoja', async () => {
    const pantalla = await render(
      <Hoja abierta alCerrar={() => undefined} etiquetaCerrar="Cerrar detalle">
        <Text>Detalle del viaje</Text>
      </Hoja>,
    );

    expect(
      pantalla.getByRole('button', { name: 'Cerrar detalle' }),
    ).toBeTruthy();
  });
});
