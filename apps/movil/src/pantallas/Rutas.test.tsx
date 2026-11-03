import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { Rutas } from './Rutas';

describe('Rutas', () => {
  it('muestra únicamente los dos corredores iniciales', async () => {
    const pantalla = await renderPantalla(<Rutas />);
    expect(pantalla.getByText('Wácwala')).toBeTruthy();
    expect(pantalla.getByText('Chagüilpa')).toBeTruthy();
    expect(pantalla.getAllByText('Managua')).toHaveLength(2);
    expect(pantalla.queryByText('Granada')).toBeNull();
    expect(pantalla.queryByText('Estelí')).toBeNull();
  });

  it('explica que faltan datos operativos sin mostrar un mapa radial', async () => {
    const pantalla = await renderPantalla(<Rutas />);
    expect(
      pantalla.getAllByText('Horarios y ubicación por confirmar'),
    ).toHaveLength(2);
    expect(
      pantalla.queryByLabelText('Mapa esquemático de rutas'),
    ).toBeNull();
  });

  it('abre el corredor elegido', async () => {
    const alAbrirRuta = jest.fn();
    const pantalla = await renderPantalla(<Rutas alAbrirRuta={alAbrirRuta} />);
    await fireEvent.press(
      pantalla.getByRole('button', {
        name: 'Abrir corredor de Wácwala a Managua',
      }),
    );
    expect(alAbrirRuta).toHaveBeenCalledWith('cor_wac_man');
  });
});
