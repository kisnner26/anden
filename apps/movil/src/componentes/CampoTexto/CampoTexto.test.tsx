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

  it('anuncia el error y marca la entrada como inválida', async () => {
    const pantalla = await render(
      <CampoTexto
        alCambiar={() => undefined}
        error="Escribí un nombre válido."
        etiqueta="Nombre completo"
        valor="1"
      />,
    );
    const entrada = pantalla.getByLabelText('Nombre completo');
    expect(entrada.props['aria-invalid']).toBe(true);
    expect(entrada.props.accessibilityHint).toBe('Escribí un nombre válido.');
    expect(pantalla.getByText('Escribí un nombre válido.')).toBeTruthy();
  });

  it('un campo de clave deja mostrar y volver a ocultar lo escrito con el ojo', async () => {
    const p = await render(
      <CampoTexto
        alCambiar={() => undefined}
        etiqueta="Contraseña"
        oculto
        valor="secreta"
      />,
    );
    expect(p.getByLabelText('Contraseña').props.secureTextEntry).toBe(true);
    await fireEvent.press(
      p.getByRole('button', { name: 'Mostrar la contraseña' }),
    );
    expect(p.getByLabelText('Contraseña').props.secureTextEntry).toBe(false);
    await fireEvent.press(
      p.getByRole('button', { name: 'Ocultar la contraseña' }),
    );
    expect(p.getByLabelText('Contraseña').props.secureTextEntry).toBe(true);
  });

  it('un campo normal no tiene ojo', async () => {
    const p = await render(
      <CampoTexto alCambiar={() => undefined} etiqueta="Nombre" valor="" />,
    );
    expect(
      p.queryByRole('button', { name: 'Mostrar la contraseña' }),
    ).toBeNull();
  });
});
