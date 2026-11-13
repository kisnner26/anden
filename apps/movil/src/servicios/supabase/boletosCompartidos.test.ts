import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('./cliente', () => ({ obtenerCliente: jest.fn() }));

import { boletoDePrueba } from '@/pruebas/boletos';

import { obtenerCliente } from './cliente';
import { leerAsientosOcupados, publicarBoletos } from './boletosCompartidos';

function clienteConErrores(errores: Record<string, { code: string } | null>) {
  const upsert = jest.fn(async (fila: { boleto_id: string }) => ({
    error: errores[fila.boleto_id] ?? null,
  }));
  return {
    cliente: {
      from: () => ({ upsert }),
      rpc: jest.fn(async () => ({ data: [3, 7, 'x'], error: null })),
    },
    upsert,
  };
}

function boleto(id: string) {
  const base = boletoDePrueba(new Date());
  return { ...base, boleto: { ...base.boleto, id } };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('publicarBoletos', () => {
  it('sin servidor no hace nada', async () => {
    jest.mocked(obtenerCliente).mockReturnValue(null);
    expect(await publicarBoletos([boleto('a')])).toEqual({
      conflictos: [],
      fallidos: [],
    });
  });

  it('un boleto que choca con un asiento vendido no frena a los demás', async () => {
    const { cliente, upsert } = clienteConErrores({
      malo: { code: '23505' },
      raro: { code: '500' },
    });
    jest.mocked(obtenerCliente).mockReturnValue(cliente as never);
    const resultado = await publicarBoletos([
      boleto('malo'),
      boleto('bueno'),
      boleto('raro'),
    ]);
    expect(upsert).toHaveBeenCalledTimes(3);
    expect(resultado.conflictos).toEqual(['malo']);
    expect(resultado.fallidos).toEqual(['raro']);
  });
});

describe('leerAsientosOcupados', () => {
  it('devuelve solo los números de asiento', async () => {
    const { cliente } = clienteConErrores({});
    jest.mocked(obtenerCliente).mockReturnValue(cliente as never);
    expect(await leerAsientosOcupados('via_2')).toEqual([3, 7]);
  });

  it('nulo sin servidor', async () => {
    jest.mocked(obtenerCliente).mockReturnValue(null);
    expect(await leerAsientosOcupados('via_2')).toBeNull();
  });
});
