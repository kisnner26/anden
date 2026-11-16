import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import type { MensajeViaje } from '@/datos/mensajesViaje';
import { renderPantalla } from '@/pruebas/render';

import { ChatViaje } from './ChatViaje';

const mensajes: MensajeViaje[] = [
  {
    de: 'chofer',
    enviadoEn: '2026-11-16T16:00:00Z',
    hilo: 'bol_1',
    id: 'm1',
    texto: 'Voy llegando a la parada',
    viajeId: 'via_2',
  },
  {
    de: 'pasajero',
    enviadoEn: '2026-11-16T16:01:00Z',
    hilo: 'bol_1',
    id: 'm2',
    texto: 'Aquí te espero',
    viajeId: 'via_2',
  },
];

/** un envío de mentira que contesta siempre lo mismo */
function envio(resultado: boolean) {
  return jest.fn(async (texto: string) => (void texto, resultado));
}

function dibujar(
  propiedades: Partial<React.ComponentProps<typeof ChatViaje>> = {},
) {
  return renderPantalla(
    <ChatViaje
      alEnviar={envio(true)}
      disponible
      mensajes={mensajes}
      nombre="Marvin"
      yo="pasajero"
      {...propiedades}
    />,
  );
}

describe('ChatViaje', () => {
  it('muestra el título con el nombre del chofer y los mensajes', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('Chat con Marvin')).toBeTruthy();
    expect(pantalla.getByText('Voy llegando a la parada')).toBeTruthy();
    expect(pantalla.getByText('Aquí te espero')).toBeTruthy();
  });

  it('sin mensajes explica para qué sirve la conversación', async () => {
    const pantalla = await dibujar({ mensajes: [] });
    expect(pantalla.getByText(/Todavía no hay mensajes/)).toBeTruthy();
  });

  it('envía lo escrito y limpia el campo', async () => {
    const alEnviar = envio(true);
    const pantalla = await dibujar({ alEnviar });
    const campo = pantalla.getByLabelText('Tu mensaje');
    await fireEvent.changeText(campo, 'Estoy en la esquina');
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Enviar mensaje' }),
    );
    expect(alEnviar).toHaveBeenCalledWith('Estoy en la esquina');
    expect(pantalla.getByLabelText('Tu mensaje').props.value).toBe('');
  });

  it('el botón de enviar está apagado con el campo vacío', async () => {
    const pantalla = await dibujar();
    expect(
      pantalla.getByRole('button', { name: 'Enviar mensaje' }).props
        .accessibilityState,
    ).toMatchObject({ disabled: true });
  });

  it('si no se pudo enviar avisa y conserva lo escrito', async () => {
    const pantalla = await dibujar({
      alEnviar: envio(false),
    });
    await fireEvent.changeText(pantalla.getByLabelText('Tu mensaje'), 'Hola');
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Enviar mensaje' }),
    );
    expect(
      pantalla.getByText('No se pudo enviar. Probá de nuevo.'),
    ).toBeTruthy();
    expect(pantalla.getByLabelText('Tu mensaje').props.value).toBe('Hola');
  });

  it('si el servidor rechazó por el viaje explica que todavía no está en camino', async () => {
    const pantalla = await dibujar({
      alEnviar: envio(false),
      razonFallo: 'fuera-de-viaje',
    });
    await fireEvent.changeText(pantalla.getByLabelText('Tu mensaje'), 'Hola');
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Enviar mensaje' }),
    );
    expect(
      pantalla.getByText(/el chofer tiene que registrar la salida/),
    ).toBeTruthy();
  });

  it('con la conversación vacía ofrece frases rápidas que se envían con un toque', async () => {
    const alEnviar = envio(true);
    const pantalla = await dibujar({
      alEnviar,
      mensajes: [],
      rapidas: ['Ya estoy en la parada'],
    });
    await fireEvent.press(pantalla.getByText('Ya estoy en la parada'));
    expect(alEnviar).toHaveBeenCalledWith('Ya estoy en la parada');
  });

  it('sin viaje en camino no hay campo para escribir y se explica por qué', async () => {
    const pantalla = await dibujar({ disponible: false });
    expect(pantalla.queryByLabelText('Tu mensaje')).toBeNull();
    expect(
      pantalla.getByText(/solo mientras el viaje va en camino/),
    ).toBeTruthy();
  });
});
