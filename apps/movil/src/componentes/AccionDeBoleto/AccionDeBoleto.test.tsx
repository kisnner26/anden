import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { AccionDeBoleto } from './AccionDeBoleto';

describe('AccionDeBoleto', () => {
  it('muestra su etiqueta y avisa al tocarla', async () => {
    const alPresionar = jest.fn();
    const pantalla = await render(
      <AccionDeBoleto
        alPresionar={alPresionar}
        etiqueta="Compartir"
        tipo="compartir"
      />,
    );
    expect(pantalla.getByText('Compartir')).toBeTruthy();
    await fireEvent.press(pantalla.getByRole('button', { name: 'Compartir' }));
    expect(alPresionar).toHaveBeenCalledTimes(1);
  });
});
