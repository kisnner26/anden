import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { renderPantalla } from '@/pruebas/render';

import { PuntoDeEncuentro } from './PuntoDeEncuentro';

afterEach(() => {
  jest.restoreAllMocks();
});

describe('PuntoDeEncuentro', () => {
  it('muestra el código completo y lo abre en el mapa', async () => {
    const abrir = jest
      .spyOn(Linking, 'openURL')
      .mockResolvedValue(true as never);
    const pantalla = await renderPantalla(
      <PuntoDeEncuentro codigo="764M4PPX+HC" />,
    );
    expect(pantalla.getByText('764M4PPX+HC')).toBeTruthy();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Abrir en el mapa' }),
    );
    expect(abrir).toHaveBeenCalledTimes(1);
  });

  it('avisa si no se pudo abrir el mapa', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('x'));
    const pantalla = await renderPantalla(
      <PuntoDeEncuentro codigo="764M4PPX+HC" />,
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Abrir en el mapa' }),
    );
    expect(await pantalla.findByText(/No pudimos abrir el mapa/)).toBeTruthy();
  });

  it('dice que falta confirmar y no ofrece mapa cuando no hay código', async () => {
    const pantalla = await renderPantalla(<PuntoDeEncuentro codigo="" />);
    expect(pantalla.getByText('punto por confirmar')).toBeTruthy();
    expect(pantalla.queryByRole('button')).toBeNull();
  });
});
