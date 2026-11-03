import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { CampoLugar } from './CampoLugar';

const LUGARES = [
  { codigo: 'UCA', id: 'ter_uca', nombre: 'Terminal UCA' },
  { codigo: 'GRA', id: 'ter_granada', nombre: 'Terminal Granada' },
] as const;

describe('CampoLugar', () => {
  it('filtra terminales y comunica el id seleccionado', async () => {
    const alCambiar = jest.fn();
    const pantalla = await render(
      <CampoLugar
        alCambiar={alCambiar}
        etiqueta="Origen"
        lugares={LUGARES}
        marcador="Elegí terminal"
        valorId="ter_uca"
      />,
    );

    await fireEvent.changeText(pantalla.getByLabelText('Origen'), 'Granada');
    expect(pantalla.getByRole('button', { name: 'Terminal Granada' })).toBeTruthy();
    expect(pantalla.queryByRole('button', { name: 'Terminal UCA' })).toBeNull();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Terminal Granada' }),
    );
    expect(alCambiar).toHaveBeenCalledWith('ter_granada');
  });
});
