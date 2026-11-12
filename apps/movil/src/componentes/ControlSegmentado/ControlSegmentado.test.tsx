import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { ControlSegmentado } from './ControlSegmentado';

const OPCIONES = [
  { clave: 'a', etiqueta: 'Próximos' },
  { clave: 'b', etiqueta: 'Historial' },
] as const;

describe('ControlSegmentado', () => {
  it('marca la opción elegida', async () => {
    const pantalla = await render(
      <ControlSegmentado
        alCambiar={() => undefined}
        opciones={OPCIONES}
        valor="b"
      />,
    );
    expect(
      pantalla.getByRole('tab', { name: 'Historial' }).props.accessibilityState,
    ).toMatchObject({ selected: true });
    expect(
      pantalla.getByRole('tab', { name: 'Próximos' }).props.accessibilityState,
    ).toMatchObject({ selected: false });
  });

  it('avisa qué opción se toca', async () => {
    const alCambiar = jest.fn();
    const pantalla = await render(
      <ControlSegmentado alCambiar={alCambiar} opciones={OPCIONES} valor="a" />,
    );
    await fireEvent.press(pantalla.getByRole('tab', { name: 'Historial' }));
    expect(alCambiar).toHaveBeenCalledWith('b');
  });
});
