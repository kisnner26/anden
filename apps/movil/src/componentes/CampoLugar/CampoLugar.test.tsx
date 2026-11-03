import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { CampoLugar, CamposLugares } from './CampoLugar';

const LUGARES = [
  { codigo: 'UCA', id: 'ter_uca', nombre: 'Terminal UCA' },
  { codigo: 'GRA', id: 'ter_boanada', nombre: 'Terminal Boaco' },
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
        textoSinResultados="No encontramos terminales."
        valorId="ter_uca"
      />,
    );

    await fireEvent.changeText(pantalla.getByLabelText('Origen'), 'Boaco');
    expect(
      pantalla.getByRole('button', { name: 'Terminal Boaco' }),
    ).toBeTruthy();
    expect(pantalla.queryByRole('button', { name: 'Terminal UCA' })).toBeNull();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Terminal Boaco' }),
    );
    expect(alCambiar).toHaveBeenCalledWith('ter_boanada');
  });

  it('intercambia el origen y destino seleccionados', async () => {
    const cambiarOrigen = jest.fn();
    const cambiarDestino = jest.fn();
    const pantalla = await render(
      <CamposLugares
        alCambiarDestino={cambiarDestino}
        alCambiarOrigen={cambiarOrigen}
        destinoId="ter_boanada"
        etiquetaDestino="Destino"
        etiquetaIntercambiar="Intercambiar lugares"
        etiquetaOrigen="Origen"
        lugares={LUGARES}
        marcador="Elegí terminal"
        origenId="ter_uca"
        textoSinResultados="No encontramos terminales."
      />,
    );

    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Intercambiar lugares' }),
    );
    expect(cambiarOrigen).toHaveBeenCalledWith('ter_boanada');
    expect(cambiarDestino).toHaveBeenCalledWith('ter_uca');
  });

  it('explica cuando no encuentra terminales', async () => {
    const pantalla = await render(
      <CampoLugar
        alCambiar={() => undefined}
        etiqueta="Origen"
        lugares={LUGARES}
        marcador="Elegí terminal"
        textoSinResultados="No encontramos terminales."
        valorId="ter_uca"
      />,
    );

    await fireEvent.changeText(pantalla.getByLabelText('Origen'), 'Bluefields');
    expect(pantalla.getByText('No encontramos terminales.')).toBeTruthy();
  });
});
