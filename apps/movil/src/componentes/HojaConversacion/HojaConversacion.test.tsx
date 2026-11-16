import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

jest.mock('@/servicios/supabase/cliente', () => ({
  obtenerCliente: jest.fn(() => null),
}));
jest.mock('@/servicios/supabase/mensajesSupabase', () => ({
  enviarMensaje: jest.fn(async () => false),
  leerMensajes: jest.fn(async () => null),
}));

import { reiniciarMensajesLocales } from '@/datos/mensajesLocales';
import { renderPantalla } from '@/pruebas/render';

import { HojaConversacion } from './HojaConversacion';

beforeEach(reiniciarMensajesLocales);

function dibujar(
  propiedades: Partial<React.ComponentProps<typeof HojaConversacion>> = {},
) {
  return renderPantalla(
    <HojaConversacion
      abierta
      alCerrar={() => undefined}
      boletoId="bol_1"
      disponible
      nombre="Ana"
      viajeId="via_2"
      {...propiedades}
    />,
  );
}

describe('HojaConversacion', () => {
  it('abierta muestra el chat con el nombre del pasajero', async () => {
    const pantalla = await dibujar();
    expect(await pantalla.findByText('Chat con Ana')).toBeTruthy();
  });

  it('ofrece frases rápidas para el chofer', async () => {
    const pantalla = await dibujar();
    expect(await pantalla.findByText('Ya podés subir')).toBeTruthy();
  });

  it('lo que escribe el chofer queda en la conversación', async () => {
    const pantalla = await dibujar();
    await fireEvent.changeText(
      await pantalla.findByLabelText('Tu mensaje'),
      'Estoy en la puerta 3',
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Enviar mensaje' }),
    );
    await waitFor(() =>
      expect(pantalla.getByText('Estoy en la puerta 3')).toBeTruthy(),
    );
  });

  it('sin viaje en camino explica que no se puede escribir', async () => {
    const pantalla = await dibujar({ disponible: false });
    expect(
      await pantalla.findByText(/solo mientras el viaje va en camino/),
    ).toBeTruthy();
  });
});
