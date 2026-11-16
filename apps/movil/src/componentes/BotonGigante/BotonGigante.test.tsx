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

  it('muestra el detalle debajo de la etiqueta', async () => {
    const pantalla = await render(
      <BotonGigante
        alPresionar={jest.fn()}
        detalle="10:30 a. m."
        etiqueta="Boaco"
      />,
    );
    expect(pantalla.getByText('10:30 a. m.')).toBeTruthy();
  });

  it('el lector de pantalla lee la etiqueta con el detalle', async () => {
    const pantalla = await render(
      <BotonGigante
        alPresionar={jest.fn()}
        detalle="10:30 a. m."
        etiqueta="Boaco"
      />,
    );
    expect(
      pantalla.getByRole('button', { name: 'Boaco. 10:30 a. m.' }),
    ).toBeTruthy();
  });
});
