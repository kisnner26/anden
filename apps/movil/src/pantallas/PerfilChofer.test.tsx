import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { PerfilChofer } from './PerfilChofer';

describe('PerfilChofer', () => {
  it('muestra el nombre y la licencia', async () => {
    const pantalla = await renderPantalla(
      <PerfilChofer alVolver={() => undefined} choferId="cho_1" />,
    );
    expect(
      pantalla.getByRole('header', { name: 'Ernesto Calero' }),
    ).toBeTruthy();
    expect(pantalla.getByText('Licencia verificada')).toBeTruthy();
  });

  it('no repite al final la regla de quién puede opinar', async () => {
    const pantalla = await renderPantalla(
      <PerfilChofer alVolver={() => undefined} choferId="cho_1" />,
    );
    expect(
      pantalla.queryByText(/Solo califican quienes ya hicieron/),
    ).toBeNull();
    expect(
      pantalla.getAllByText(/Podés opinar cuando termine un viaje/),
    ).toHaveLength(1);
  });

  it('muestra los años, los viajes y la calificación', async () => {
    const pantalla = await renderPantalla(
      <PerfilChofer alVolver={() => undefined} choferId="cho_1" />,
    );
    expect(pantalla.getByText('6')).toBeTruthy();
    expect(pantalla.getByText('1800')).toBeTruthy();
    expect(pantalla.getByText('4.7')).toBeTruthy();
  });

  it('lista lo que más dicen con su conteo', async () => {
    const pantalla = await renderPantalla(
      <PerfilChofer alVolver={() => undefined} choferId="cho_1" />,
    );
    expect(pantalla.getByText('Puntual')).toBeTruthy();
    expect(pantalla.getByText('Manejo seguro')).toBeTruthy();
  });

  it('vuelve con la flecha', async () => {
    const alVolver = jest.fn();
    const pantalla = await renderPantalla(
      <PerfilChofer alVolver={alVolver} choferId="cho_1" />,
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Volver' }));
    expect(alVolver).toHaveBeenCalledTimes(1);
  });

  it('en un chofer inexistente hay una flecha para volver', async () => {
    const alVolver = jest.fn();
    const pantalla = await renderPantalla(
      <PerfilChofer alVolver={alVolver} choferId="cho_x" />,
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Volver' }));
    expect(alVolver).toHaveBeenCalledTimes(1);
  });

  it('dice que no encontró un chofer inexistente', async () => {
    const pantalla = await renderPantalla(
      <PerfilChofer alVolver={() => undefined} choferId="cho_x" />,
    );
    expect(pantalla.getByText('No encontramos a este chofer.')).toBeTruthy();
  });
});
