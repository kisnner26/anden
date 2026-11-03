import { describe, expect, it } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { NOMBRES_ICONO } from '@/componentes/Icono';

import { Vitrina } from './Vitrina';

describe('Vitrina', () => {
  it('muestra la identidad visual', async () => {
    const pantalla = await render(<Vitrina />);
    expect(pantalla.getByText('Vitrina')).toBeTruthy();
    expect(pantalla.getByText('¿Para dónde vas?')).toBeTruthy();
    expect(pantalla.getByText('Ámbar')).toBeTruthy();
  });

  it('alterna entre los dos temas', async () => {
    const pantalla = await render(<Vitrina />);
    expect(pantalla.getByText('Tema oscuro')).toBeTruthy();
    await fireEvent.press(
      pantalla.getByLabelText('Cambiar tema de la vitrina'),
    );
    expect(pantalla.getByText('Tema claro')).toBeTruthy();
  });

  it('expone el selector como interruptor accesible', async () => {
    const pantalla = await render(<Vitrina />);
    const selector = pantalla.getByRole('switch', {
      name: 'Cambiar tema de la vitrina',
    });
    expect(selector.props.accessibilityState).toEqual({ checked: false });
  });

  it('muestra todos los íconos ilustrados', async () => {
    const pantalla = await render(<Vitrina />);
    for (const nombre of NOMBRES_ICONO) {
      expect(pantalla.getByRole('image', { name: nombre })).toBeTruthy();
    }
  });

  it('muestra los controles y permite cambiar el filtro', async () => {
    const pantalla = await render(<Vitrina />);
    const hoy = pantalla.getByRole('button', { name: 'Hoy' });
    const manana = pantalla.getByRole('button', { name: 'Mañana' });

    expect(
      pantalla.getByRole('button', { name: 'Buscar salidas' }),
    ).toBeOnTheScreen();
    expect(
      pantalla.getByRole('button', { name: 'Seguir viaje' }),
    ).toBeOnTheScreen();
    expect(
      pantalla.getAllByTestId('boton-principal-fondo').length,
    ).toBeGreaterThan(0);
    expect(pantalla.getByTestId('boton-secundario-fondo')).toBeOnTheScreen();
    expect(pantalla.getByTestId('chip-fondo-barro')).toBeOnTheScreen();
    expect(hoy.props.accessibilityState).toEqual(
      expect.objectContaining({
        selected: true,
      }),
    );

    await fireEvent.press(manana);

    expect(
      pantalla.getByRole('button', { name: 'Mañana' }).props.accessibilityState,
    ).toEqual(expect.objectContaining({ selected: true }));
  });

  it('el botón del tablero cambia la hora y el estado de la fila', async () => {
    const pantalla = await render(<Vitrina />);
    expect(pantalla.queryByText('+10 min')).toBeNull();
    await fireEvent.press(pantalla.getByText('Cambiar hora y estado'));
    expect(pantalla.getByText('+10 min')).toBeTruthy();
  });
});
