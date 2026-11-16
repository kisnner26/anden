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

  it('el lector de pantalla lee la etiqueta accesible si la hay', async () => {
    const pantalla = await render(
      <AccionDeBoleto
        alPresionar={jest.fn()}
        etiqueta="Aviso"
        etiquetaAccesible="Activar el aviso antes de la salida"
        tipo="recordatorio"
      />,
    );
    expect(
      pantalla.getByRole('button', {
        name: 'Activar el aviso antes de la salida',
      }),
    ).toBeTruthy();
  });

  it('sin etiqueta accesible lee la etiqueta visible', async () => {
    const pantalla = await render(
      <AccionDeBoleto
        alPresionar={jest.fn()}
        etiqueta="Pantalla"
        tipo="pantalla"
      />,
    );
    expect(pantalla.getByRole('button', { name: 'Pantalla' })).toBeTruthy();
  });
});
