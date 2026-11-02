import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { BotonAccion } from './BotonAccion';

describe('BotonAccion', () => {
  it('se anuncia como botón con su etiqueta', async () => {
    const pantalla = await render(
      <BotonAccion alPresionar={() => undefined} etiqueta="Ver boleto" />,
    );
    expect(pantalla.getByRole('button', { name: 'Ver boleto' })).toBeTruthy();
  });

  it('avisa al presionarlo', async () => {
    const alPresionar = jest.fn();
    const pantalla = await render(
      <BotonAccion alPresionar={alPresionar} etiqueta="Seguir" />,
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Seguir' }));
    expect(alPresionar).toHaveBeenCalledTimes(1);
  });

  it('no avisa cuando está deshabilitado', async () => {
    const alPresionar = jest.fn();
    const pantalla = await render(
      <BotonAccion alPresionar={alPresionar} deshabilitado etiqueta="Seguir" />,
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Seguir' }));
    expect(alPresionar).not.toHaveBeenCalled();
  });
});
