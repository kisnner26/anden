import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';

import { useMovimientoReducido } from '@/tema/useMovimientoReducido';

import { EsqueletoIA } from './EsqueletoIA';

jest.mock('@/tema/useMovimientoReducido', () => ({
  useMovimientoReducido: jest.fn(() => false),
}));

beforeEach(() => {
  jest.mocked(useMovimientoReducido).mockReturnValue(false);
});

describe('EsqueletoIA', () => {
  it('se dibuja mientras llega la respuesta', async () => {
    const pantalla = await render(<EsqueletoIA />);
    expect(pantalla.toJSON()).not.toBeNull();
  });
});
