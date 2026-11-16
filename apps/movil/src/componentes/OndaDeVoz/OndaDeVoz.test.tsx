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
});
