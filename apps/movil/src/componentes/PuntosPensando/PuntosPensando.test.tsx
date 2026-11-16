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
});
