import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { boletoDePrueba } from '@/pruebas/boletos';

import { FilaBoleto } from './FilaBoleto';

const GUARDADO = boletoDePrueba(new Date(2026, 10, 2, 14, 40));

describe('FilaBoleto', () => {
  it('muestra destino, cuándo sale, asiento y código', async () => {
    const pantalla = await render(
      <FilaBoleto
        alPresionar={() => undefined}
        ahora={new Date(2026, 10, 2, 13, 40)}
        guardado={GUARDADO}
      />,
    );
    expect(pantalla.getByText('Granada')).toBeTruthy();
    expect(pantalla.getByText('lun 2 nov, 2:40 p. m.')).toBeTruthy();
    expect(pantalla.getByText('Asiento 8 · K7RM4QX9')).toBeTruthy();
  });

  it('avisa el id del boleto al presionarla', async () => {
    const alPresionar = jest.fn();
    const pantalla = await render(
      <FilaBoleto
        alPresionar={alPresionar}
        ahora={new Date(2026, 10, 2, 13, 40)}
        guardado={GUARDADO}
      />,
    );
    await fireEvent.press(pantalla.getByRole('button'));
    expect(alPresionar).toHaveBeenCalledWith('bol_K7RM4QX9');
  });
});
