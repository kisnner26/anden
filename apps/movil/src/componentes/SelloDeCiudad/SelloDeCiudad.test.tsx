import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';

import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

import { SelloDeCiudad } from './SelloDeCiudad';

jest.mock('@/tema/useMovimientoReducido', () => ({
  useMovimientoReducido: jest.fn(() => false),
}));

beforeEach(() => {
  jest.mocked(useMovimientoReducido).mockReturnValue(false);
});

describe('SelloDeCiudad', () => {
  it('con viajes se anuncia con la ciudad y las llegadas', async () => {
    const pantalla = await render(
      <SelloDeCiudad
        ciudad="Boaco"
        llegadas={3}
        primera="2026-10-05T14:00:00.000Z"
      />,
    );
    expect(
      pantalla.getByLabelText(
        rellenar(t('pasaporte.selloAccesible'), {
          ciudad: 'Boaco',
          llegadas: 3,
        }),
      ),
    ).toBeTruthy();
  });

  it('sin viajes se anuncia vacío', async () => {
    const pantalla = await render(
      <SelloDeCiudad ciudad="Juigalpa" llegadas={0} primera={null} />,
    );
    expect(
      pantalla.getByLabelText(
        rellenar(t('pasaporte.selloVacio'), { ciudad: 'Juigalpa' }),
      ),
    ).toBeTruthy();
  });

  it('es un solo elemento accesible', async () => {
    const pantalla = await render(
      <SelloDeCiudad
        ciudad="Managua"
        llegadas={1}
        primera="2026-10-05T14:00:00.000Z"
      />,
    );
    expect(pantalla.getAllByLabelText(/Managua/)).toHaveLength(1);
  });

  it('cada ciudad se dibuja distinta', async () => {
    const a = JSON.stringify(
      (
        await render(
          <SelloDeCiudad
            ciudad="Managua"
            llegadas={1}
            primera="2026-10-05T14:00:00.000Z"
          />,
        )
      ).toJSON(),
    );
    const b = JSON.stringify(
      (
        await render(
          <SelloDeCiudad
            ciudad="Boaco"
            llegadas={1}
            primera="2026-10-05T14:00:00.000Z"
          />,
        )
      ).toJSON(),
    );
    expect(a).not.toBe(b);
  });

  it('con movimiento reducido se dibuja igual', async () => {
    jest.mocked(useMovimientoReducido).mockReturnValue(true);
    const pantalla = await render(
      <SelloDeCiudad
        ciudad="Boaco"
        llegadas={2}
        primera="2026-10-05T14:00:00.000Z"
      />,
    );
    expect(pantalla.toJSON()).not.toBeNull();
  });
});
