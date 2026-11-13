import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@/servicios/supabase/boletosCompartidos', () => ({
  leerAsientosOcupados: jest.fn(),
}));

import { leerAsientosOcupados } from '@/servicios/supabase/boletosCompartidos';

import { sincronizarAsientos } from './asientosRemotos';
import { obtenerMuestra, reiniciarMuestra } from './useSalidas';

function tomados(viajeId: string): number[] {
  return obtenerMuestra()
    .ocupaciones.filter((o) => o.viajeId === viajeId && o.estado === 'vendido')
    .map((o) => o.asiento);
}

beforeEach(() => {
  jest.clearAllMocks();
  reiniciarMuestra();
});

describe('sincronizarAsientos', () => {
  it('deja tomados los asientos que vendió otro teléfono', async () => {
    jest.mocked(leerAsientosOcupados).mockResolvedValue([41, 42]);
    expect(await sincronizarAsientos('via_3')).toBe(2);
    expect(tomados('via_3')).toEqual(expect.arrayContaining([41, 42]));
  });

  it('no repite lo que ya estaba tomado', async () => {
    jest.mocked(leerAsientosOcupados).mockResolvedValue([41]);
    await sincronizarAsientos('via_3');
    expect(await sincronizarAsientos('via_3')).toBe(0);
  });

  it('sin respuesta del servidor no cambia nada', async () => {
    jest.mocked(leerAsientosOcupados).mockResolvedValue(null);
    expect(await sincronizarAsientos('via_3')).toBe(0);
  });
});
