import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';

import { coloresOscuros } from '@/tema/colores';

import { FichaFlap } from './FichaFlap';

describe('FichaFlap', () => {
  it('muestra un caracter de hora en su propia ficha', async () => {
    const pantalla = await render(
      <FichaFlap caracter="4" color={coloresOscuros.ambar} />,
    );

    expect(pantalla.getByText('4')).toBeOnTheScreen();
    expect(pantalla.getByTestId('ficha-flap')).toBeOnTheScreen();
  });
});
