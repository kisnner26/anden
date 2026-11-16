import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';

import { FormaPaquete } from './FormaPaquete';

describe('FormaPaquete', () => {
  it('dibuja el sobre', async () => {
    const pantalla = await render(<FormaPaquete tamano="sobre" />);
    expect(pantalla.toJSON()).not.toBeNull();
  });
});
