import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { ProveedorFavoritos } from '@/datos/ProveedorFavoritos';
import { renderPantalla } from '@/pruebas/render';

import { Rutas } from './Rutas';

beforeEach(async () => {
  await AsyncStorage.clear();
});

function activar(control: Parameters<typeof fireEvent>[0]) {
  return fireEvent(control, 'accessibilityAction', {
    nativeEvent: { actionName: 'activate' },
  });
}

describe('Rutas', () => {
  it('empieza con Boaco hacia Managua en el panel', async () => {
    const pantalla = await renderPantalla(<Rutas />);
    expect(pantalla.getByText('Rutas.')).toBeTruthy();
    expect(
      pantalla.getByRole('button', {
        name: /^Cambiar el sentido: de Managua a Boaco/,
      }),
    ).toBeTruthy();
  });

  it('elegir Juigalpa en la red cambia el corredor', async () => {
    const alAbrirRuta = jest.fn();
    const pantalla = await renderPantalla(<Rutas alAbrirRuta={alAbrirRuta} />);
    await fireEvent.press(
      pantalla.getAllByRole('button', { name: 'Juigalpa' })[0]!,
    );
    await activar(
      pantalla.getByRole('button', { name: 'Deslizar para abrir' }),
    );
    await fireEvent.press(await pantalla.findByTestId('escena-viaje'));
    expect(alAbrirRuta).toHaveBeenCalledWith('cor_jui_man');
  });

  it('tocar Managua o el botón central invierte el sentido', async () => {
    const alAbrirRuta = jest.fn();
    const pantalla = await renderPantalla(<Rutas alAbrirRuta={alAbrirRuta} />);
    await fireEvent.press(
      pantalla.getByRole('button', { name: /^Cambiar el sentido/ }),
    );
    await activar(
      pantalla.getByRole('button', { name: 'Deslizar para abrir' }),
    );
    await fireEvent.press(await pantalla.findByTestId('escena-viaje'));
    expect(alAbrirRuta).toHaveBeenCalledWith('cor_man_boa');
  });

  it('abre el corredor elegido al deslizar', async () => {
    const alAbrirRuta = jest.fn();
    const pantalla = await renderPantalla(<Rutas alAbrirRuta={alAbrirRuta} />);
    await activar(
      pantalla.getByRole('button', { name: 'Deslizar para abrir' }),
    );
    // primero se ve la escena del bus y al terminar se abre el corredor
    expect(await pantalla.findByTestId('escena-viaje')).toBeTruthy();
    expect(alAbrirRuta).not.toHaveBeenCalled();
    await fireEvent.press(pantalla.getByTestId('escena-viaje'));
    expect(alAbrirRuta).toHaveBeenCalledWith('cor_boa_man');
  });

  it('marca el corredor como favorito desde el panel', async () => {
    const pantalla = await renderPantalla(
      <ProveedorFavoritos>
        <Rutas />
      </ProveedorFavoritos>,
    );
    await fireEvent.press(
      pantalla.getByRole('button', {
        name: /^Marcar Boaco a Managua como favorita/,
      }),
    );
    expect(
      await pantalla.findByRole('button', {
        name: /^Quitar Boaco a Managua de favoritas/,
      }),
    ).toBeTruthy();
  });

  it('muestra la salida, el ETA estimado y los asientos libres', async () => {
    const pantalla = await renderPantalla(<Rutas />);
    expect(pantalla.getByText('Sale')).toBeTruthy();
    expect(pantalla.getByText('ETA h:min')).toBeTruthy();
    expect(pantalla.getByText('Libres')).toBeTruthy();
    expect(pantalla.getAllByText(/^\d+:\d{2}$/)).toHaveLength(2);
    expect(pantalla.getByText(/^Sale en \d+ min$/)).toBeTruthy();
    expect(pantalla.getByText(/no garantizados/)).toBeTruthy();
  });

  it('ofrece enviar una encomienda y lleva a pedirla', async () => {
    const alAbrirEncomiendas = jest.fn();
    const pantalla = await renderPantalla(
      <Rutas alAbrirEncomiendas={alAbrirEncomiendas} />,
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: /Enviar una encomienda/ }),
    );
    expect(alAbrirEncomiendas).toHaveBeenCalledTimes(1);
  });

  it('dice que los datos son ilustrativos y no muestra otras ciudades', async () => {
    const pantalla = await renderPantalla(<Rutas />);
    expect(
      pantalla.getByText(/ilustrativos hasta tener datos en vivo/),
    ).toBeTruthy();
    expect(pantalla.queryByText('Granada')).toBeNull();
  });
});
