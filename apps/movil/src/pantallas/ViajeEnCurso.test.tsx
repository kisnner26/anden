import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { CLAVE_BOLETOS, ProveedorBoletos } from '@/datos/ProveedorBoletos';
import { leerOpiniones } from '@/datos/opiniones';
import { reiniciarMuestra } from '@/datos/useSalidas';
import { boletoDePrueba } from '@/pruebas/boletos';
import { renderPantalla } from '@/pruebas/render';

import { ViajeEnCurso } from './ViajeEnCurso';

beforeEach(async () => {
  await AsyncStorage.clear();
  reiniciarMuestra();
  await AsyncStorage.setItem(
    CLAVE_BOLETOS,
    JSON.stringify([boletoDePrueba(new Date(Date.now() - 20 * 60_000))]),
  );
});

function dibujar(
  propiedades: Partial<Parameters<typeof ViajeEnCurso>[0]> = {},
) {
  return renderPantalla(
    <ProveedorBoletos>
      <ViajeEnCurso
        alVerBoleto={() => undefined}
        alVerChofer={() => undefined}
        alVolver={() => undefined}
        boletoId="bol_K7RM4QX9"
        {...propiedades}
      />
    </ProveedorBoletos>,
  );
}

describe('ViajeEnCurso', () => {
  it('dice a qué hora llega el viaje', async () => {
    const pantalla = await dibujar();
    expect(await pantalla.findByText(/^Llegás a las ~/)).toBeTruthy();
  });

  it('muestra la unidad con su placa y quién conduce', async () => {
    const pantalla = await dibujar();
    expect(await pantalla.findByText('M 222-114')).toBeTruthy();
    expect(pantalla.getByText('Marvin')).toBeTruthy();
  });

  it('sin transmisión del bus avisa que la hora es la prevista', async () => {
    const pantalla = await dibujar();
    expect(await pantalla.findByText(/Sin señal del bus/)).toBeTruthy();
  });

  it('ofrece hablar con el chofer, seguridad y calificar', async () => {
    const pantalla = await dibujar();
    expect(
      await pantalla.findByRole('button', { name: 'Hablar con el chofer' }),
    ).toBeTruthy();
    expect(
      pantalla.getAllByRole('button', { name: 'Seguridad' }).length,
    ).toBeGreaterThan(0);
    expect(pantalla.getByText('Calificá a tu chofer')).toBeTruthy();
  });

  it('hablar con el chofer abre la conversación', async () => {
    const pantalla = await dibujar();
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Hablar con el chofer' }),
    );
    expect(await pantalla.findByTestId('chat-viaje')).toBeTruthy();
  });

  it('seguridad abre el panel con sus opciones', async () => {
    const pantalla = await dibujar();
    const botones = await pantalla.findAllByRole('button', {
      name: 'Seguridad',
    });
    await fireEvent.press(botones[0]!);
    expect(await pantalla.findByTestId('panel-seguridad-viaje')).toBeTruthy();
  });

  it('tocar una estrella guarda la opinión del boleto', async () => {
    const pantalla = await dibujar();
    await fireEvent.press(await pantalla.findByLabelText('5 de 5 estrellas'));
    await waitFor(async () =>
      expect(await leerOpiniones()).toEqual([
        expect.objectContaining({ boletoId: 'bol_K7RM4QX9', estrellas: 5 }),
      ]),
    );
    expect(
      await pantalla.findByText('Gracias, tu opinión quedó guardada.'),
    ).toBeTruthy();
  });

  it('con un boleto que no existe lo dice y deja volver', async () => {
    const alVolver = jest.fn();
    const pantalla = await dibujar({ alVolver, boletoId: 'bol_nada' });
    await fireEvent.press(await pantalla.findByText('Volver'));
    expect(alVolver).toHaveBeenCalledTimes(1);
  });
});
