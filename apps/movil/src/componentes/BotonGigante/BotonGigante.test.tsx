import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { BotonGigante } from './BotonGigante';

describe('BotonGigante', () => {
  it('muestra la etiqueta y avisa al tocarlo', async () => {
    const alPresionar = jest.fn();
    const pantalla = await render(
      <BotonGigante alPresionar={alPresionar} etiqueta="Boaco" />,
    );
    expect(pantalla.getByText('Boaco')).toBeTruthy();
    await fireEvent.press(pantalla.getByRole('button'));
    expect(alPresionar).toHaveBeenCalledTimes(1);
  });
});
