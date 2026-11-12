import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { useEffect, useState, type ReactNode } from 'react';

import { VIAJE_BOACO } from '@/datos/muestra';
import { ProveedorBoletos } from '@/datos/ProveedorBoletos';
import { ProveedorReserva } from '@/datos/ProveedorReserva';
import type { PasajeroReserva } from '@/datos/reserva';
import { useReserva } from '@/datos/useReserva';
import { reiniciarMuestra } from '@/datos/useSalidas';
import { renderPantalla } from '@/pruebas/render';

import { Pago } from './Pago';

function Preparar({
  children,
  pasajeros,
}: {
  children: ReactNode;
  pasajeros?: PasajeroReserva[];
}) {
  const { establecerBorrador } = useReserva();
  const [preparado, establecerPreparado] = useState(!pasajeros);
  useEffect(() => {
    if (pasajeros && !preparado) {
      establecerBorrador(VIAJE_BOACO, pasajeros);
      establecerPreparado(true);
    }
  }, [establecerBorrador, pasajeros, preparado]);
  return pasajeros && !preparado ? null : <>{children}</>;
}

const DOS = [
  { asiento: 8, nombre: 'Ana Ruiz' },
  { asiento: 9, nombre: 'Luis Pérez' },
];

function dibujar(
  pasajeros?: PasajeroReserva[],
  alReservado: (id: string) => void = () => undefined,
) {
  return renderPantalla(
    <ProveedorBoletos>
      <ProveedorReserva>
        <Preparar pasajeros={pasajeros}>
          <Pago
            alReservado={alReservado}
            alVolver={() => undefined}
            viajeId={VIAJE_BOACO}
          />
        </Preparar>
      </ProveedorReserva>
    </ProveedorBoletos>,
  );
}

beforeEach(async () => {
  await AsyncStorage.clear();
  reiniciarMuestra();
});

describe('Pago', () => {
  it('avisa si no hay asientos elegidos', async () => {
    const pantalla = await dibujar();
    expect(
      pantalla.getByText('No hay asientos elegidos. Volvé a elegirlos.'),
    ).toBeTruthy();
  });

  it('muestra el resumen de la reserva con sus pasajeros y la placa', async () => {
    const pantalla = await dibujar(DOS);
    expect(await pantalla.findByText('Mercado Mayoreo')).toBeTruthy();
    expect(pantalla.getByText('Boaco')).toBeTruthy();
    expect(pantalla.getByText('8, 9')).toBeTruthy();
    expect(pantalla.getByText(/Ana Ruiz · Luis Pérez/)).toBeTruthy();
    expect(pantalla.getByText(/M 222-114/)).toBeTruthy();
  });

  it('muestra el total de la tarifa de muestra a pagar al abordar', async () => {
    const pantalla = await dibujar(DOS);
    expect(await pantalla.findByText('C$ 140')).toBeTruthy();
    expect(pantalla.getByText(/tarifa de muestra · C\$ 70/)).toBeTruthy();
  });

  it('muestra solo el pago en efectivo al abordar', async () => {
    const pantalla = await dibujar(DOS);
    expect(await pantalla.findByText(/No se cobra nada ahora/)).toBeTruthy();
    expect(pantalla.queryByText('Próximamente')).toBeNull();
    expect(pantalla.queryByRole('radio')).toBeNull();
  });

  it('explica que no se cobra nada ahora y que se paga el monto exacto', async () => {
    const pantalla = await dibujar(DOS);
    expect(await pantalla.findByText(/No se cobra nada ahora/)).toBeTruthy();
  });

  it('confirma la reserva y avisa el boleto creado', async () => {
    const alReservado = jest.fn();
    const pantalla = await dibujar(DOS, alReservado);
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Confirmar reserva' }),
    );
    expect(
      await pantalla.findByLabelText(/Reserva lista.*Código de abordaje/),
    ).toBeTruthy();
    await waitFor(() => expect(alReservado).toHaveBeenCalledTimes(1));
    expect(String(alReservado.mock.calls[0]?.[0])).toMatch(/^bol_/);
  });

  it('tras confirmar muestra el pase y deja abrir el boleto sin cerrarse sola', async () => {
    const alVerBoleto = jest.fn();
    const pantalla = await renderPantalla(
      <ProveedorBoletos>
        <ProveedorReserva>
          <Preparar pasajeros={DOS}>
            <Pago
              alVerBoleto={alVerBoleto}
              alVolver={() => undefined}
              viajeId={VIAJE_BOACO}
            />
          </Preparar>
        </ProveedorReserva>
      </ProveedorBoletos>,
    );
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Confirmar reserva' }),
    );
    expect(await pantalla.findByTestId('talon-boleto')).toBeTruthy();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Ver mi boleto' }),
    );
    expect(String(alVerBoleto.mock.calls[0]?.[0])).toMatch(/^bol_/);
  });

  it('avisa si un asiento ya no está libre', async () => {
    const pantalla = await dibujar([{ asiento: 2, nombre: 'Ana Ruiz' }]);
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Confirmar reserva' }),
    );
    expect(
      await pantalla.findByText(
        'Alguno de esos asientos ya no está libre. Elegí otros.',
      ),
    ).toBeTruthy();
  });
});
