import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent } from '@testing-library/react-native';

jest.mock('@/servicios/supabase/transferenciasSupabase', () => ({
  cancelarTransferencia: jest.fn(async () => true),
  crearTransferencia: jest.fn(),
  leerEstadoDeTransferencia: jest.fn(),
}));

import { ContextoBoletos, type ValorBoletos } from '@/datos/useBoletos';
import { renderPantalla } from '@/pruebas/render';
import {
  cancelarTransferencia,
  crearTransferencia,
  leerEstadoDeTransferencia,
} from '@/servicios/supabase/transferenciasSupabase';

import { CADA_CUANTO_MS, Transferir } from './Transferir';

const guardado = {
  boleto: {
    asiento: 4,
    codigo: 'ABCD2345',
    compradoEn: '2026-11-14T10:00:00.000Z',
    duenoId: 'usu_1',
    estado: 'vigente',
    id: 'bol_9',
    pasajero: { esMenorEnBrazos: false, nombre: 'Luis' },
    precio: 46,
    viajeId: 'v1',
  },
  resumen: {
    choferId: 'c1',
    choferNombre: 'Ana',
    cooperativa: 'Coop',
    destino: 'Boaco',
    metodoPago: 'efectivo-al-abordar',
    placa: 'M 1',
    puntoEncuentro: '',
    salida: '2026-11-20T10:00:00.000Z',
    servicio: 'ordinario',
  },
};

const quitar = jest.fn<(...args: unknown[]) => Promise<void>>(
  async () => undefined,
);

function envolver(alVolver = jest.fn()) {
  const valor = {
    agregar: async () => undefined,
    boletos: [guardado],
    cancelar: async () => undefined,
    cargando: false,
    quitar,
    reservar: async () => ({ error: 'viaje-inexistente', ok: false }),
    validar: async () => undefined,
  } as unknown as ValorBoletos;
  return renderPantalla(
    <ContextoBoletos.Provider value={valor}>
      <Transferir alVolver={alVolver} boletoId="bol_9" />
    </ContextoBoletos.Provider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(crearTransferencia).mockResolvedValue('ABCD2345');
});

describe('Transferir', () => {
  it('muestra el código y ofrece compartirlo', async () => {
    const pantalla = await envolver();
    expect(await pantalla.findByLabelText('Código ABCD-2345')).toBeTruthy();
    expect(
      pantalla.getByRole('button', { name: 'Compartir el código' }),
    ).toBeTruthy();
  });

  it('deja reintentar si no se pudo preparar la oferta', async () => {
    jest.mocked(crearTransferencia).mockResolvedValueOnce(null);
    const pantalla = await envolver();
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Reintentar' }),
    );
    expect(await pantalla.findByLabelText('Código ABCD-2345')).toBeTruthy();
    expect(crearTransferencia).toHaveBeenCalledTimes(2);
  });

  it('cancela la oferta y vuelve', async () => {
    const alVolver = jest.fn();
    const pantalla = await envolver(alVolver);
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Cancelar la oferta' }),
    );
    expect(cancelarTransferencia).toHaveBeenCalledWith('ABCD2345');
    expect(alVolver).toHaveBeenCalled();
  });

  it('cuando la otra persona lo canjea, saca el boleto de este teléfono', async () => {
    jest.useFakeTimers();
    try {
      jest.mocked(leerEstadoDeTransferencia).mockResolvedValue({
        estado: 'reclamada',
        expiraEn: '',
        paraNombre: 'Marta',
      } as never);
      const pantalla = await envolver();
      await act(async () => {
        await jest.advanceTimersByTimeAsync(CADA_CUANTO_MS + 50);
      });
      expect(pantalla.getByText('Ahora es de Marta')).toBeTruthy();
      await act(async () => {
        await jest.advanceTimersByTimeAsync(3000);
      });
      expect(quitar).toHaveBeenCalledWith('bol_9');
    } finally {
      jest.useRealTimers();
    }
  });
});
