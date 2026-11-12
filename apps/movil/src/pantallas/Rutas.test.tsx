import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { ProveedorFavoritos } from '@/datos/ProveedorFavoritos';
import { renderPantalla } from '@/pruebas/render';

import { Rutas } from './Rutas';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('Rutas', () => {
  it('pone primero, dentro de su grupo, el corredor favorito', async () => {
    await AsyncStorage.setItem(
      'anden.favoritos',
      JSON.stringify(['cor_man_boa']),
    );
    const pantalla = await renderPantalla(
      <ProveedorFavoritos>
        <Rutas />
      </ProveedorFavoritos>,
    );
    const nombres = () =>
      pantalla
        .getAllByRole('button', { name: /^Abrir / })
        .map((boton) => boton.props.accessibilityLabel as string);

    await waitFor(() => expect(nombres()[0]).toBe('Abrir Managua a Boaco'));
    expect(nombres()[1]).toBe('Abrir Boaco a Managua');
  });

  it('sin favoritos mantiene el orden de siempre', async () => {
    const pantalla = await renderPantalla(
      <ProveedorFavoritos>
        <Rutas />
      </ProveedorFavoritos>,
    );
    const nombres = pantalla
      .getAllByRole('button', { name: /^Abrir / })
      .map((boton) => boton.props.accessibilityLabel as string);
    expect(nombres[0]).toBe('Abrir Boaco a Managua');
  });

  it('muestra los cuatro sentidos del corredor inicial', async () => {
    const pantalla = await renderPantalla(<Rutas />);
    expect(pantalla.getAllByText('Boaco')).toHaveLength(2);
    expect(pantalla.getAllByText('Juigalpa')).toHaveLength(2);
    expect(pantalla.getAllByText('Managua')).toHaveLength(4);
    expect(pantalla.queryByText('Granada')).toBeNull();
    expect(pantalla.queryByText('Estelí')).toBeNull();
  });

  it('agrupa los sentidos en dos corredores reconocibles', async () => {
    const pantalla = await renderPantalla(<Rutas />);
    expect(pantalla.getByText('Boaco · Managua')).toBeTruthy();
    expect(pantalla.getByText('Juigalpa · Managua')).toBeTruthy();
    expect(pantalla.getAllByRole('button', { name: /^Abrir / })).toHaveLength(
      4,
    );
  });

  it('explica que faltan datos operativos sin mostrar un mapa radial', async () => {
    const pantalla = await renderPantalla(<Rutas />);
    expect(
      pantalla.getAllByText('Horarios y ubicación por confirmar'),
    ).toHaveLength(1);
    expect(
      pantalla.getAllByText(
        'La hora, el estado y la llegada son ilustrativos hasta tener datos en vivo.',
      ),
    ).toHaveLength(1);
    expect(pantalla.queryByLabelText('Mapa esquemático de rutas')).toBeNull();
  });

  it('abre el corredor elegido', async () => {
    const alAbrirRuta = jest.fn();
    const pantalla = await renderPantalla(<Rutas alAbrirRuta={alAbrirRuta} />);
    await fireEvent.press(
      pantalla.getByRole('button', {
        name: 'Abrir Boaco a Managua',
      }),
    );
    expect(alAbrirRuta).toHaveBeenCalledWith('cor_boa_man');
  });
});
