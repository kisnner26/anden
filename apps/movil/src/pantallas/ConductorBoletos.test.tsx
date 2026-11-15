import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { fireEvent, within } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { ProveedorCierres } from '@/datos/ProveedorCierres';
import { ProveedorPagos } from '@/datos/ProveedorPagos';
import { ProveedorSesion } from '@/datos/ProveedorSesion';
import type { BoletoGuardado } from '@/datos/reserva';
import { salidasDeChofer } from '@/datos/salidas';
import { ContextoBoletos, type ValorBoletos } from '@/datos/useBoletos';
import { obtenerMuestra } from '@/datos/useSalidas';
import { boletoDePrueba } from '@/pruebas/boletos';
import { renderPantalla } from '@/pruebas/render';
import { CLAVE_CIERRES, type CierreViaje } from '@/servicios/cierres';

import { ConductorBoletos } from './ConductorBoletos';

beforeEach(async () => {
  await AsyncStorage.clear();
  await AsyncStorage.setItem(
    'anden.sesion',
    JSON.stringify({ choferId: 'cho_2', nombre: 'Marvin', rol: 'conductor' }),
  );
});

function envolver(boletos: BoletoGuardado[], hijos: ReactNode) {
  const valor = {
    agregar: async () => undefined,
    boletos,
    cancelar: async () => undefined,
    cargando: false,
    quitar: async () => undefined,
    reservar: async () => ({ error: 'viaje-inexistente', ok: false }),
    validar: async () => undefined,
  } as unknown as ValorBoletos;
  return (
    <ProveedorSesion>
      <ProveedorPagos>
        <ProveedorCierres>
          <ContextoBoletos.Provider value={valor}>
            {hijos}
          </ContextoBoletos.Provider>
        </ProveedorCierres>
      </ProveedorPagos>
    </ProveedorSesion>
  );
}

function boletoEnViaje(viajeId: string, codigo: string, asiento: number) {
  const g = boletoDePrueba(new Date(), asiento, codigo);
  return { ...g, boleto: { ...g.boleto, precio: 66, viajeId } };
}

describe('ConductorBoletos', () => {
  it('muestra los totales y los viajes activos con sus ventas', async () => {
    const viaje = salidasDeChofer(obtenerMuestra(), new Date(), 'cho_2')[0]!;
    const p = await renderPantalla(
      envolver(
        [
          boletoEnViaje(viaje.viajeId, 'AAAA1111', 3),
          boletoEnViaje(viaje.viajeId, 'BBBB2222', 4),
        ],
        <ConductorBoletos />,
      ),
    );
    expect(await p.findByText('Por cobrar')).toBeTruthy();
    const tarjeta = within(p.getByTestId(`viaje-vendido-${viaje.viajeId}`));
    expect(tarjeta.getByText('2')).toBeTruthy();
    expect(tarjeta.getByText(/Ganaste C\$ 0 de C\$ 132/)).toBeTruthy();
  });

  it('al tocar un viaje se ven los nombres de quienes compraron', async () => {
    const viaje = salidasDeChofer(obtenerMuestra(), new Date(), 'cho_2')[0]!;
    const p = await renderPantalla(
      envolver(
        [boletoEnViaje(viaje.viajeId, 'AAAA1111', 3)],
        <ConductorBoletos />,
      ),
    );
    const tarjeta = within(
      await p.findByTestId(`viaje-vendido-${viaje.viajeId}`),
    );
    await fireEvent.press(tarjeta.getByRole('button'));
    expect(await p.findByText('Ana Ruiz')).toBeTruthy();
  });

  it('los viajes ya cerrados salen en Pasados con lo que cobró', async () => {
    const cierre: CierreViaje = {
      cerradoEn: new Date(Date.now() - 86_400_000 * 3).toISOString(),
      choferId: 'cho_2',
      cobrado: 100,
      pagados: 2,
      pasajeros: 3,
      pendiente: 40,
      sinPagar: [{ asiento: 4, boletoId: 'b', nombre: 'Luis', precio: 40 }],
      total: 140,
      viajeId: 'via_vieja',
    };
    await AsyncStorage.setItem(CLAVE_CIERRES, JSON.stringify([cierre]));
    const p = await renderPantalla(envolver([], <ConductorBoletos />));
    await fireEvent.press(await p.findByRole('tab', { name: /^Pasados/ }));
    expect(await p.findByText('Viaje cerrado')).toBeTruthy();
    expect(p.getByText(/Ganaste C\$ 100 de C\$ 140/)).toBeTruthy();
  });
});
