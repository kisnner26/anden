import { beforeEach, describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import { useReducedMotion, withTiming } from 'react-native-reanimated';

import { coloresOscuros } from '@/tema/colores';
import { movimiento } from '@/tema/movimiento';

import { FichaFlap } from './FichaFlap';

interface MockSimulado {
  mockClear: () => void;
  mockReturnValue: (valor: boolean) => void;
}
const caida = withTiming as unknown as MockSimulado;
const reducir = useReducedMotion as unknown as MockSimulado;

beforeEach(() => {
  caida.mockClear();
  reducir.mockReturnValue(false);
});

describe('FichaFlap', () => {
  it('muestra un caracter de hora en su propia ficha', async () => {
    const pantalla = await render(
      <FichaFlap caracter="4" color={coloresOscuros.ambar} />,
    );

    expect(pantalla.getByText('4')).toBeOnTheScreen();
    expect(pantalla.getByTestId('ficha-flap')).toBeOnTheScreen();
  });

  it('cae en su lugar cuando cambia el carácter', async () => {
    const pantalla = await render(<FichaFlap caracter="4" color="#fff" />);
    await pantalla.rerender(<FichaFlap caracter="5" color="#fff" />);

    expect(caida).toHaveBeenCalledWith(1, {
      duration: movimiento.cambioEstado,
    });
    expect(pantalla.getByText('5')).toBeOnTheScreen();
  });

  it('no cae si el carácter sigue igual', async () => {
    const pantalla = await render(<FichaFlap caracter="4" color="#fff" />);
    await pantalla.rerender(<FichaFlap caracter="4" color="#000" />);

    expect(caida).not.toHaveBeenCalled();
  });

  it('cambia sin animación cuando el sistema pide reducir movimiento', async () => {
    reducir.mockReturnValue(true);
    const pantalla = await render(<FichaFlap caracter="4" color="#fff" />);
    await pantalla.rerender(<FichaFlap caracter="5" color="#fff" />);

    expect(caida).not.toHaveBeenCalled();
    expect(pantalla.getByText('5')).toBeOnTheScreen();
  });

  it('el separador nunca gira', async () => {
    const pantalla = await render(<FichaFlap caracter=":" color="#fff" />);
    await pantalla.rerender(<FichaFlap caracter=":" color="#000" />);

    expect(caida).not.toHaveBeenCalled();
  });
});
