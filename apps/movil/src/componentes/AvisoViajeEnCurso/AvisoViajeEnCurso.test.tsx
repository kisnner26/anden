import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { AvisoViajeEnCurso } from './AvisoViajeEnCurso';

describe('AvisoViajeEnCurso', () => {
  it('dice que el bus ya salió y a dónde va', async () => {
    const pantalla = await renderPantalla(
      <AvisoViajeEnCurso alSeguir={jest.fn()} destino="Boaco" />,
    );
    expect(pantalla.getByText('El bus ya salió')).toBeTruthy();
    expect(
      pantalla.getByText('Tu bus a Boaco ya salió. Seguilo en el mapa.'),
    ).toBeTruthy();
  });

  it('al tocarlo lleva a seguir el viaje', async () => {
    const alSeguir = jest.fn();
    const pantalla = await renderPantalla(
      <AvisoViajeEnCurso alSeguir={alSeguir} destino="Boaco" />,
    );
    await fireEvent.press(pantalla.getByRole('button'));
    expect(alSeguir).toHaveBeenCalledTimes(1);
  });
});
