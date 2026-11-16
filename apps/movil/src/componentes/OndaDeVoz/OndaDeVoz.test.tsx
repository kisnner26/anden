import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';

import { useMovimientoReducido } from '@/tema/useMovimientoReducido';

import { OndaDeVoz } from './OndaDeVoz';

jest.mock('@/tema/useMovimientoReducido', () => ({
  useMovimientoReducido: jest.fn(() => false),
}));

beforeEach(() => {
  jest.mocked(useMovimientoReducido).mockReturnValue(false);
});

describe('OndaDeVoz', () => {
  it('se dibuja al escuchar', async () => {
    const pantalla = await render(<OndaDeVoz tono="escucha" />);
    expect(pantalla.toJSON()).not.toBeNull();
  });

  it('se dibuja al hablar', async () => {
    const pantalla = await render(<OndaDeVoz tono="habla" />);
    expect(pantalla.toJSON()).not.toBeNull();
  });

  it('no se lee en voz alta porque es solo decoración', async () => {
    const pantalla = await render(<OndaDeVoz />);
    expect(JSON.stringify(pantalla.toJSON())).toContain(
      '"accessibilityElementsHidden":true',
    );
  });

  it('escuchar y hablar se ven con colores distintos', async () => {
    const a = JSON.stringify(
      (await render(<OndaDeVoz tono="escucha" />)).toJSON(),
    );
    const b = JSON.stringify(
      (await render(<OndaDeVoz tono="habla" />)).toJSON(),
    );
    expect(a).not.toBe(b);
  });
});
