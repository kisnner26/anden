import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';

import { useMovimientoReducido } from '@/tema/useMovimientoReducido';

import { PuntosPensando } from './PuntosPensando';

jest.mock('@/tema/useMovimientoReducido', () => ({
  useMovimientoReducido: jest.fn(() => false),
}));

beforeEach(() => {
  jest.mocked(useMovimientoReducido).mockReturnValue(false);
});

describe('PuntosPensando', () => {
  it('se dibuja mientras la IA piensa', async () => {
    const pantalla = await render(<PuntosPensando />);
    expect(pantalla.toJSON()).not.toBeNull();
  });

  it('no se lee en voz alta porque es solo decoración', async () => {
    const pantalla = await render(<PuntosPensando />);
    expect(JSON.stringify(pantalla.toJSON())).toContain(
      '"accessibilityElementsHidden":true',
    );
  });

  it('dibuja tres puntos', async () => {
    const pantalla = await render(<PuntosPensando />);
    const fila = pantalla.toJSON() as { children: unknown[] };
    expect(fila.children).toHaveLength(3);
  });
});
