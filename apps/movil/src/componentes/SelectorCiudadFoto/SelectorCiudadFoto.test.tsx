import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { SelectorCiudadFoto } from './SelectorCiudadFoto';

const OPCIONES = [
  { clave: 'Boaco', etiqueta: 'Boaco' },
  { clave: 'Juigalpa', etiqueta: 'Juigalpa' },
] as const;

describe('SelectorCiudadFoto', () => {
  it('muestra cada ciudad con su foto y marca la elegida', async () => {
    const p = await renderPantalla(
      <SelectorCiudadFoto
        alCambiar={() => undefined}
        opciones={OPCIONES}
        valor="Boaco"
      />,
    );
    expect(p.getByLabelText('Foto de Boaco')).toBeTruthy();
    expect(
      p.getByRole('tab', { name: 'Boaco' }).props.accessibilityState,
    ).toMatchObject({ selected: true });
    expect(
      p.getByRole('tab', { name: 'Juigalpa' }).props.accessibilityState,
    ).toMatchObject({ selected: false });
  });

  it('avisa la ciudad que se toca', async () => {
    const alCambiar = jest.fn();
    const p = await renderPantalla(
      <SelectorCiudadFoto
        alCambiar={alCambiar}
        opciones={OPCIONES}
        valor="Boaco"
      />,
    );
    await fireEvent.press(p.getByRole('tab', { name: 'Juigalpa' }));
    expect(alCambiar).toHaveBeenCalledWith('Juigalpa');
  });
});
