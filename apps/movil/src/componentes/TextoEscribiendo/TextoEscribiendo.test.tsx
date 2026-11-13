import { describe, expect, it, jest } from '@jest/globals';
import { waitFor } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { TextoEscribiendo } from './TextoEscribiendo';

describe('TextoEscribiendo', () => {
  it('sin animar muestra el texto completo y avisa que terminó', async () => {
    const alTerminar = jest.fn();
    const pantalla = await renderPantalla(
      <TextoEscribiendo
        alTerminar={alTerminar}
        animado={false}
        texto="Sale a las 2:30"
      />,
    );
    expect(pantalla.getByText('Sale a las 2:30')).toBeTruthy();
    await waitFor(() => expect(alTerminar).toHaveBeenCalled());
  });

  it('animado termina mostrando todo el texto', async () => {
    const pantalla = await renderPantalla(
      <TextoEscribiendo texto="Hola desde la IA" />,
    );
    await waitFor(() =>
      expect(pantalla.getByText('Hola desde la IA')).toBeTruthy(),
    );
  });
});
