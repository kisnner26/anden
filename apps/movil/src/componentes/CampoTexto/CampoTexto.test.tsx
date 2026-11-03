import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { CampoTexto } from './CampoTexto';

describe('CampoTexto', () => {
  it('muestra el rótulo y el valor', async () => {
    const pantalla = await render(
      <CampoTexto
        alCambiar={() => undefined}
        etiqueta="Nombre completo"
        valor="Ana Ruiz"
      />,
    );
    expect(pantalla.getByText('Nombre completo')).toBeTruthy();
    expect(pantalla.getByLabelText('Nombre completo').props.value).toBe(
      'Ana Ruiz',
    );
  });

  it('avisa lo que se escribe', async () => {
    const alCambiar = jest.fn();
    const pantalla = await render(
      <CampoTexto alCambiar={alCambiar} etiqueta="Nombre completo" valor="" />,
    );
    await fireEvent.changeText(
      pantalla.getByLabelText('Nombre completo'),
      'Luis',
    );
    expect(alCambiar).toHaveBeenCalledWith('Luis');
  });
});
