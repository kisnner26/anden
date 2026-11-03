import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { CabeceraPantalla } from './CabeceraPantalla';

describe('CabeceraPantalla', () => {
  it('muestra el titular como encabezado', async () => {
    const pantalla = await render(
      <CabeceraPantalla alVolver={() => undefined} titulo="Boaco" />,
    );
    expect(pantalla.getByRole('header')).toBeTruthy();
    expect(pantalla.getByText(/Boaco/)).toBeTruthy();
  });

  it('vuelve al presionar la flecha', async () => {
    const alVolver = jest.fn();
    const pantalla = await render(
      <CabeceraPantalla alVolver={alVolver} titulo="Boaco" />,
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Volver' }));
    expect(alVolver).toHaveBeenCalledTimes(1);
  });
});
