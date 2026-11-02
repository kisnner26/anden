import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { Boletos } from './Boletos';

describe('Boletos', () => {
  it('muestra el estado vacío con honestidad', async () => {
    const pantalla = await renderPantalla(
      <Boletos alBuscar={() => undefined} />,
    );
    expect(pantalla.getByText('Todavía no tenés boletos')).toBeTruthy();
  });

  it('lleva a buscar salidas', async () => {
    const alBuscar = jest.fn();
    const pantalla = await renderPantalla(<Boletos alBuscar={alBuscar} />);
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Buscar salidas' }),
    );
    expect(alBuscar).toHaveBeenCalledTimes(1);
  });
});
