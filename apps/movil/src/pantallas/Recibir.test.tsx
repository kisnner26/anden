import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

jest.mock('@/servicios/supabase/transferenciasSupabase', () => ({
  reclamarTransferencia: jest.fn(),
}));

import { ContextoBoletos, type ValorBoletos } from '@/datos/useBoletos';
import { renderPantalla } from '@/pruebas/render';
import { reclamarTransferencia } from '@/servicios/supabase/transferenciasSupabase';

import { Recibir } from './Recibir';

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

const agregar = jest.fn<(...args: unknown[]) => Promise<void>>(
  async () => undefined,
);

function envolver(codigo?: string, alVerBoleto = jest.fn()) {
  const valor = {
    agregar,
    boletos: [],
    cancelar: async () => undefined,
    cargando: false,
    quitar: async () => undefined,
    reservar: async () => ({ error: 'viaje-inexistente', ok: false }),
    validar: async () => undefined,
  } as unknown as ValorBoletos;
  return renderPantalla(
    <ContextoBoletos.Provider value={valor}>
      <Recibir
        alVerBoleto={alVerBoleto}
        alVolver={() => undefined}
        codigoInicial={codigo}
      />
    </ContextoBoletos.Provider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Recibir', () => {
  it('canjea solo el código que llega por el enlace y muestra el boleto', async () => {
    jest
      .mocked(reclamarTransferencia)
      .mockResolvedValue({ boleto: guardado } as never);
    const alVerBoleto = jest.fn();
    const pantalla = await envolver('abcd-2345', alVerBoleto);
    expect(await pantalla.findByText('Ahora es tuyo')).toBeTruthy();
    expect(reclamarTransferencia).toHaveBeenCalledWith('ABCD2345');
    expect(agregar).toHaveBeenCalledWith(guardado);
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Ver mi boleto' }),
    );
    expect(alVerBoleto).toHaveBeenCalledWith('bol_9');
  });

  it('explica por qué no se pudo canjear', async () => {
    jest
      .mocked(reclamarTransferencia)
      .mockResolvedValue({ error: 'vencida' } as never);
    const pantalla = await envolver('ABCD2345');
    expect(
      await pantalla.findByText('Ese código venció. Pedí uno nuevo.'),
    ).toBeTruthy();
    expect(agregar).not.toHaveBeenCalled();
  });

  it('canjea al completar las ocho letras escritas', async () => {
    jest
      .mocked(reclamarTransferencia)
      .mockResolvedValue({ error: 'no-existe' } as never);
    const pantalla = await envolver();
    expect(reclamarTransferencia).not.toHaveBeenCalled();
    await fireEvent.changeText(
      pantalla.getByLabelText('Código del boleto'),
      'abcd2345',
    );
    await waitFor(() =>
      expect(reclamarTransferencia).toHaveBeenCalledWith('ABCD2345'),
    );
  });
});
