import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';

import { useMovimientoReducido } from '@/tema/useMovimientoReducido';

import { BrilloQueBarre } from './BrilloQueBarre';

jest.mock('@/tema/useMovimientoReducido', () => ({
  useMovimientoReducido: jest.fn(() => false),
}));

beforeEach(() => {
  jest.mocked(useMovimientoReducido).mockReturnValue(false);
});

describe('BrilloQueBarre', () => {
  it('se dibuja cuando hay movimiento', async () => {
    const pantalla = await render(<BrilloQueBarre />);
    expect(pantalla.toJSON()).not.toBeNull();
  });

  it('no se dibuja con movimiento reducido', async () => {
    jest.mocked(useMovimientoReducido).mockReturnValue(true);
    const pantalla = await render(<BrilloQueBarre />);
    expect(pantalla.toJSON()).toBeNull();
  });

  it('no recibe toques', async () => {
    const pantalla = await render(<BrilloQueBarre />);
    expect(JSON.stringify(pantalla.toJSON())).toContain(
      '"pointerEvents":"none"',
    );
  });

  it('acepta pausa y retardo propios', async () => {
    const pantalla = await render(<BrilloQueBarre pausa={500} retardo={200} />);
    expect(pantalla.toJSON()).not.toBeNull();
  });
});
