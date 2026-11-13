import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, waitFor } from '@testing-library/react-native';

import { ContextoIA, type ValorIA } from '@/datos/useIA';
import { ContextoVoz } from '@/datos/useVoz';
import type { OyentesDeVoz, ServicioVoz } from '@/servicios/voz';
import { renderPantalla } from '@/pruebas/render';

import { Asistente } from './Asistente';

function valor(cambios: Partial<ValorIA> = {}): ValorIA {
  return {
    activada: true,
    cambiar: async () => undefined,
    cargando: false,
    disponibilidad: 'disponible',
    nombre: 'Apple Intelligence',
    preguntar: jest.fn(async () => 'El próximo bus a Boaco sale a las 2:30.'),
    usable: true,
    ...cambios,
  };
}

function vozFalsa(resultado: 'ok' | 'sin-permiso' | 'no-disponible' = 'ok') {
  let oyentes: OyentesDeVoz | null = null;
  const voz = {
    callar: jest.fn(async () => undefined),
    detener: jest.fn(async () => undefined),
    escuchar: jest.fn(async (o: OyentesDeVoz) => {
      oyentes = o;
      return resultado;
    }),
    hablar: jest.fn<ServicioVoz['hablar']>(async () => undefined),
  } satisfies ServicioVoz;
  return {
    decir: (texto: string) => oyentes?.alTexto(texto, true),
    terminar: () => oyentes?.alTerminar(),
    voz,
  };
}

function abrir(contexto: ValorIA, voz: ServicioVoz = vozFalsa().voz) {
  return renderPantalla(
    <ContextoIA.Provider value={contexto}>
      <ContextoVoz.Provider value={voz}>
        <Asistente alVolver={() => undefined} />
      </ContextoVoz.Provider>
    </ContextoIA.Provider>,
  );
}

beforeEach(async () => {
  // el interruptor de voz se recuerda entre pruebas si no se limpia
  await AsyncStorage.clear();
});

describe('Asistente', () => {
  it('sin la IA usable explica por qué y no deja preguntar', async () => {
    const pantalla = await abrir(
      valor({ disponibilidad: 'no-compatible', usable: false }),
    );
    expect(pantalla.getByText('El asistente no está activado.')).toBeTruthy();
    expect(
      pantalla.getByText(/no es compatible con Apple Intelligence/),
    ).toBeTruthy();
    expect(pantalla.queryByRole('button', { name: 'Preguntar' })).toBeNull();
  });

  it('manda la pregunta con los datos de la app y muestra la respuesta', async () => {
    const contexto = valor();
    const pantalla = await abrir(contexto);
    await fireEvent.changeText(
      pantalla.getByLabelText('Tu pregunta'),
      '¿Cuándo sale el bus a Boaco?',
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Preguntar' }));
    expect(
      await pantalla.findByText('El próximo bus a Boaco sale a las 2:30.'),
    ).toBeTruthy();
    const [instrucciones, pregunta] = (
      contexto.preguntar as jest.Mock<ValorIA['preguntar']>
    ).mock.calls[0] as [string, string];
    expect(pregunta).toBe('¿Cuándo sale el bus a Boaco?');
    expect(instrucciones).toContain('Usá solamente los datos de abajo');
    expect(instrucciones).toContain('Próximas salidas:');
  });

  it('una sugerencia pregunta de inmediato', async () => {
    const contexto = valor();
    const pantalla = await abrir(contexto);
    const sugerencias = pantalla.getAllByRole('button', { name: /^¿.*\?$/ });
    await fireEvent.press(sugerencias[0]!);
    await waitFor(() => expect(contexto.preguntar).toHaveBeenCalledTimes(1));
  });

  it('si el modelo falla lo dice y no inventa una respuesta', async () => {
    const pantalla = await abrir(
      valor({
        preguntar: async () => {
          throw new Error('fallo');
        },
      }),
    );
    await fireEvent.changeText(pantalla.getByLabelText('Tu pregunta'), 'hola');
    await fireEvent.press(pantalla.getByRole('button', { name: 'Preguntar' }));
    expect(
      await pantalla.findByText('No pudimos responder. Probá de nuevo.'),
    ).toBeTruthy();
  });

  it('dice que está potenciado por la IA del teléfono', async () => {
    const pantalla = await abrir(valor());
    expect(
      pantalla.getByText('Potenciado por Apple Intelligence'),
    ).toBeTruthy();
  });

  it('muestra la animación de pensar mientras espera la respuesta', async () => {
    let terminar: (texto: string) => void = () => undefined;
    const contexto = valor({
      preguntar: jest.fn(
        () => new Promise<string>((resolver) => (terminar = resolver)),
      ),
    });
    const pantalla = await abrir(contexto);
    await fireEvent.changeText(pantalla.getByLabelText('Tu pregunta'), 'hola');
    await fireEvent.press(pantalla.getByRole('button', { name: 'Preguntar' }));
    expect(
      await pantalla.findByText('Pensando con Apple Intelligence…'),
    ).toBeTruthy();
    terminar('Listo.');
    expect(await pantalla.findByText('Listo.')).toBeTruthy();
    expect(pantalla.queryByText('Pensando con Apple Intelligence…')).toBeNull();
  });

  it('ofrece sugerencias con destinos reales y borra la conversación', async () => {
    const pantalla = await abrir(valor());
    await fireEvent.changeText(pantalla.getByLabelText('Tu pregunta'), 'hola');
    await fireEvent.press(pantalla.getByRole('button', { name: 'Preguntar' }));
    await pantalla.findByText('El próximo bus a Boaco sale a las 2:30.');
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Borrar la conversación' }),
    );
    await waitFor(() =>
      expect(
        pantalla.queryByText('El próximo bus a Boaco sale a las 2:30.'),
      ).toBeNull(),
    );
  });

  it('deja solo tres preguntas sugeridas', async () => {
    const pantalla = await abrir(valor());
    expect(pantalla.getAllByRole('button', { name: /^¿.*\?$/ })).toHaveLength(
      3,
    );
  });

  it('se le habla: lo dictado se manda como pregunta al terminar de escuchar', async () => {
    const { decir, terminar, voz } = vozFalsa();
    const contexto = valor();
    const pantalla = await abrir(contexto, voz);
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Hablarle a Andén' }),
    );
    await waitFor(() => expect(voz.escuchar).toHaveBeenCalled());
    await act(async () => {
      decir('¿cuándo sale el bus a Boaco?');
      terminar();
    });
    await waitFor(() => expect(contexto.preguntar).toHaveBeenCalled());
    expect(
      (contexto.preguntar as jest.Mock<ValorIA['preguntar']>).mock
        .calls[0]?.[1],
    ).toBe('¿cuándo sale el bus a Boaco?');
    // le hablaste, así que contesta hablando aunque el interruptor esté apagado
    await waitFor(() => expect(voz.hablar).toHaveBeenCalled());
  });

  it('avisa si no hay permiso para el micrófono', async () => {
    const { voz } = vozFalsa('sin-permiso');
    const pantalla = await abrir(valor(), voz);
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Hablarle a Andén' }),
    );
    expect(
      await pantalla.findByText(/Sin permiso para usar el micrófono/),
    ).toBeTruthy();
  });

  it('con la respuesta en voz alta encendida lee lo que contesta', async () => {
    const { voz } = vozFalsa();
    const pantalla = await abrir(valor(), voz);
    await fireEvent.press(
      pantalla.getByRole('switch', { name: 'Responder en voz alta' }),
    );
    await fireEvent.changeText(pantalla.getByLabelText('Tu pregunta'), 'hola');
    await fireEvent.press(pantalla.getByRole('button', { name: 'Preguntar' }));
    await waitFor(() =>
      expect(voz.hablar).toHaveBeenCalledWith(
        'El próximo bus a Boaco sale a las 2:30.',
        expect.objectContaining({ enLinea: false }),
      ),
    );
  });

  it('mientras habla lo muestra y se puede callar', async () => {
    const { voz } = vozFalsa();
    voz.hablar.mockImplementation(async (_texto, opciones) => {
      opciones?.alEstado?.(true);
    });
    const pantalla = await abrir(valor(), voz);
    await fireEvent.press(
      pantalla.getByRole('switch', { name: 'Responder en voz alta' }),
    );
    await fireEvent.changeText(pantalla.getByLabelText('Tu pregunta'), 'hola');
    await fireEvent.press(pantalla.getByRole('button', { name: 'Preguntar' }));
    expect(await pantalla.findByText('Andén está hablando…')).toBeTruthy();
    await fireEvent.press(pantalla.getByRole('button', { name: 'Callar' }));
    await waitFor(() =>
      expect(pantalla.queryByText('Andén está hablando…')).toBeNull(),
    );
    expect(voz.callar).toHaveBeenCalled();
  });
});
