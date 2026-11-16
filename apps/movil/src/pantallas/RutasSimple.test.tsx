import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { RutasSimple } from './RutasSimple';

describe('RutasSimple', () => {
  it('ofrece un botón por cada viaje de ida y de vuelta', async () => {
    const pantalla = await renderPantalla(
      <RutasSimple alBuscar={jest.fn()} alSalir={jest.fn()} />,
    );
    for (const viaje of [
      'Managua a Boaco',
      'Boaco a Managua',
      'Managua a Juigalpa',
      'Juigalpa a Managua',
    ]) {
      expect(pantalla.getByText(viaje)).toBeTruthy();
    }
  });

  it('tocar un viaje busca salidas hacia su destino', async () => {
    const alBuscar = jest.fn();
    const pantalla = await renderPantalla(
      <RutasSimple alBuscar={alBuscar} alSalir={jest.fn()} />,
    );
    await fireEvent.press(pantalla.getByText('Managua a Boaco'));
    expect(alBuscar).toHaveBeenCalledWith('Boaco');
    await fireEvent.press(pantalla.getByText('Juigalpa a Managua'));
    expect(alBuscar).toHaveBeenCalledWith('Managua');
  });

  it('cada viaje dice cuántos kilómetros son', async () => {
    const pantalla = await renderPantalla(
      <RutasSimple alBuscar={jest.fn()} alSalir={jest.fn()} />,
    );
    expect(pantalla.getAllByText(/\d+ km/).length).toBe(4);
  });
});
