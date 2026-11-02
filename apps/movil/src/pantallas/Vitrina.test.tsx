import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';

import { Vitrina } from './Vitrina';

describe('Vitrina', () => {
  it('muestra la identidad visual', async () => {
    const pantalla = await render(<Vitrina />);
    expect(pantalla.getByText('Vitrina')).toBeTruthy();
    expect(pantalla.getByText('¿Para dónde vas?')).toBeTruthy();
    expect(pantalla.getByText('Ámbar')).toBeTruthy();
  });
});
