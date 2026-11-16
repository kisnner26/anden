import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';

import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { t } from '@/textos/t';

import { RecorridoPasaporte } from './RecorridoPasaporte';

jest.mock('@/tema/useMovimientoReducido', () => ({
  useMovimientoReducido: jest.fn(() => false),
}));

beforeEach(() => {
  jest.mocked(useMovimientoReducido).mockReturnValue(false);
});

const HECHAS = [
  { ciudad: 'Managua', llegadas: 2, primera: '2026-10-01T10:00:00.000Z' },
  { ciudad: 'Boaco', llegadas: 3, primera: '2026-10-05T14:00:00.000Z' },
  { ciudad: 'Juigalpa', llegadas: 0, primera: null },
] as const;

describe('RecorridoPasaporte', () => {
  it('con rutas hechas se anuncia como recorrido', async () => {
    const pantalla = await render(<RecorridoPasaporte ciudades={HECHAS} />);
    expect(pantalla.getByLabelText(t('pasaporte.recorrido'))).toBeTruthy();
  });

  it('sin ninguna ruta hecha se anuncia vacío', async () => {
    const vacias = HECHAS.map((c) => ({ ...c, llegadas: 0, primera: null }));
    const pantalla = await render(<RecorridoPasaporte ciudades={vacias} />);
    expect(pantalla.getByLabelText(t('pasaporte.recorridoVacio'))).toBeTruthy();
  });

  it('tiene su identificador de prueba', async () => {
    const pantalla = await render(<RecorridoPasaporte ciudades={HECHAS} />);
    expect(pantalla.getByTestId('recorrido-pasaporte')).toBeTruthy();
  });

  it('con movimiento reducido se dibuja igual', async () => {
    jest.mocked(useMovimientoReducido).mockReturnValue(true);
    const pantalla = await render(<RecorridoPasaporte ciudades={HECHAS} />);
    expect(pantalla.getByTestId('recorrido-pasaporte')).toBeTruthy();
  });
});
