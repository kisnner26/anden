import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

jest.mock('@/servicios/supabase/estadoBoletosSupabase', () => ({
  leerEstadoDeBoletos: jest.fn(),
}));

import { boletoDePrueba } from '@/pruebas/boletos';
import { renderPantalla } from '@/pruebas/render';
import { leerEstadoDeBoletos } from '@/servicios/supabase/estadoBoletosSupabase';

import { ProveedorEstadoBoletos } from './ProveedorEstadoBoletos';
import { ProveedorSesion } from './ProveedorSesion';
import { ContextoBoletos, type ValorBoletos } from './useBoletos';
import { useEstadoRemotoBoletos } from './useEstadoRemotoBoletos';

function Sonda() {
  const { abordados, pagados } = useEstadoRemotoBoletos();
  return (
    <Text testID="estado">{`${[...abordados].join(',')}|${[...pagados].join(',')}`}</Text>
  );
}

const validar = jest.fn<(id: string) => Promise<void>>(async () => undefined);

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  await AsyncStorage.setItem(
    'anden.sesion',
    JSON.stringify({ nombre: 'ana ruiz', rol: 'pasajero' }),
  );
});

describe('ProveedorEstadoBoletos', () => {
  it('cuando el conductor marca que abordó, el boleto pasa a usado y se ve el pago', async () => {
    jest.mocked(leerEstadoDeBoletos).mockResolvedValue({
      abordados: ['bol_AAAA1111'],
      pagados: ['bol_AAAA1111'],
    });
    const valor = {
      agregar: async () => undefined,
      boletos: [
        boletoDePrueba(new Date(Date.now() + 3_600_000), 4, 'AAAA1111'),
      ],
      cancelar: async () => undefined,
      cargando: false,
      quitar: async () => undefined,
      reservar: async () => ({ error: 'viaje-inexistente', ok: false }),
      validar,
    } as unknown as ValorBoletos;
    const p = await renderPantalla(
      <ProveedorSesion>
        <ContextoBoletos.Provider value={valor}>
          <ProveedorEstadoBoletos>
            <Sonda />
          </ProveedorEstadoBoletos>
        </ContextoBoletos.Provider>
      </ProveedorSesion>,
    );
    await waitFor(() =>
      expect(p.getByTestId('estado').props.children).toBe(
        'bol_AAAA1111|bol_AAAA1111',
      ),
    );
    expect(validar).toHaveBeenCalledWith('bol_AAAA1111');
  });
});
