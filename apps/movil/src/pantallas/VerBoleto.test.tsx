import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Share } from 'react-native';

import { CLAVE_BOLETOS, ProveedorBoletos } from '@/datos/ProveedorBoletos';
import { reiniciarMuestra } from '@/datos/useSalidas';
import { boletoDePrueba } from '@/pruebas/boletos';
import { renderPantalla } from '@/pruebas/render';

import { VerBoleto } from './VerBoleto';

beforeEach(async () => {
  await AsyncStorage.clear();
  reiniciarMuestra();
  await AsyncStorage.setItem(
    CLAVE_BOLETOS,
    JSON.stringify([boletoDePrueba(new Date(Date.now() + 60 * 60_000))]),
  );
});

function dibujar(propiedades: Partial<Parameters<typeof VerBoleto>[0]> = {}) {
  return renderPantalla(
    <ProveedorBoletos>
      <VerBoleto
        alCancelado={() => undefined}
        alVerChofer={() => undefined}
        alVolver={() => undefined}
        boletoId="bol_K7RM4QX9"
        {...propiedades}
      />
    </ProveedorBoletos>,
  );
}

describe('VerBoleto', () => {
  it('muestra el talón con el código, el QR y el destino', async () => {
    const pantalla = await dibujar();
    expect(await pantalla.findByTestId('talon-boleto')).toBeTruthy();
    expect(pantalla.getByText('K7RM 4QX9')).toBeTruthy();
    expect(pantalla.getByLabelText('QR K7RM4QX9')).toBeTruthy();
  });

  it('recuerda cuánto pagar al abordar y llevar el monto exacto', async () => {
    const pantalla = await dibujar();
    expect(await pantalla.findByText('Pagás al abordar')).toBeTruthy();
    expect(pantalla.getAllByText('C$ 46')).toHaveLength(2);
    expect(pantalla.getByText('Llevá el monto exacto.')).toBeTruthy();
  });

  it('abre el perfil del chofer', async () => {
    const alVerChofer = jest.fn();
    const pantalla = await dibujar({ alVerChofer });
    await fireEvent.press(
      await pantalla.findByRole('button', { name: /Ver chofer/ }),
    );
    expect(alVerChofer).toHaveBeenCalledWith('cho_2');
  });

  it('comparte datos del viaje sin exponer el código de abordaje', async () => {
    const compartir = jest.spyOn(Share, 'share').mockResolvedValue({
      action: 'dismissedAction',
      activityType: undefined,
    });
    const pantalla = await dibujar();
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Compartir datos del viaje' }),
    );
    expect(compartir).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.not.stringContaining('K7RM4QX9') }),
    );
    compartir.mockRestore();
  });

  it('pide confirmación antes de cancelar y permite mantener la reserva', async () => {
    const pantalla = await dibujar();
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Cancelar reserva' }),
    );
    expect(pantalla.getByText('¿Cancelar esta reserva?')).toBeTruthy();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'No, mantener' }),
    );
    expect(
      pantalla.getByRole('button', { name: 'Cancelar reserva' }),
    ).toBeTruthy();
  });

  it('cancela la reserva y conserva el boleto con su estado', async () => {
    const alCancelado = jest.fn();
    const pantalla = await dibujar({ alCancelado });
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Cancelar reserva' }),
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Sí, cancelar' }),
    );
    await waitFor(() => expect(alCancelado).toHaveBeenCalledTimes(1));
    expect(await AsyncStorage.getItem(CLAVE_BOLETOS)).toContain('"estado":"cancelado"');
  });

  it('dice que no encontró un boleto inexistente', async () => {
    const pantalla = await dibujar({ boletoId: 'bol_x' });
    expect(
      await pantalla.findByText('No encontramos este boleto.'),
    ).toBeTruthy();
  });
});
