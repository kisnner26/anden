import { describe, expect, it } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

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
});
