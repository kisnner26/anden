import { expect, test } from '@jest/globals';
import { render } from '@testing-library/react-native';

import Inicio from './index';

test('muestra el titulo de inicio', async () => {
  const pantalla = await render(<Inicio />);

  expect(pantalla.getByText('Andén')).toBeOnTheScreen();
});
