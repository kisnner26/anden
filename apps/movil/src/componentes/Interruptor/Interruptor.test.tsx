import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { Interruptor } from './Interruptor';

describe('Interruptor', () => {
  it('avisa con el valor contrario al tocarlo', async () => {
    const alCambiar = jest.fn();
    const pantalla = await renderPantalla(
      <Interruptor activo={false} alCambiar={alCambiar} etiqueta="Bloqueo" />,
    );
    await fireEvent.press(pantalla.getByRole('switch', { name: 'Bloqueo' }));
    expect(alCambiar).toHaveBeenCalledWith(true);
  });

  it('expone su estado a los lectores de pantalla', async () => {
    const pantalla = await renderPantalla(
      <Interruptor activo alCambiar={jest.fn()} etiqueta="Bloqueo" />,
    );
    expect(
      pantalla.getByRole('switch', { name: 'Bloqueo' }).props
        .accessibilityState,
    ).toMatchObject({ checked: true });
  });

  it('no responde si está deshabilitado', async () => {
    const alCambiar = jest.fn();
    const pantalla = await renderPantalla(
      <Interruptor
        activo={false}
        alCambiar={alCambiar}
        deshabilitado
        etiqueta="Bloqueo"
      />,
    );
    await fireEvent.press(pantalla.getByRole('switch', { name: 'Bloqueo' }));
    expect(alCambiar).not.toHaveBeenCalled();
  });
});
