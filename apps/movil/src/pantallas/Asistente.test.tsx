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
    expect(instrucciones).toContain('usá solamente los datos de abajo');
    expect(instrucciones).toContain('Próximas salidas:');
  });

  it('una sugerencia pregunta de inmediato', async () => {
    const contexto = valor();
    const pantalla = await abrir(contexto);
    const sugerencias = pantalla.getAllByRole('button', { name: /^¿.*\?$/ });
    await fireEvent.press(sugerencias[0]!);
    // la sugerencia se contesta: con el modelo, o directo si es una orden que la app entiende
    expect(await pantalla.findByText('Apple Intelligence')).toBeTruthy();
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

  it('mientras escucha el botón pasa a Detener y no se corta solo', async () => {
    const { decir, terminar, voz } = vozFalsa();
    const contexto = valor();
    const pantalla = await abrir(contexto, voz);
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Hablarle a Andén' }),
    );
    const detener = await pantalla.findByRole('button', {
      name: 'Detener y enviar',
    });
    // sigue abierto aunque llegue texto: no se envía hasta que la persona lo detiene
    await act(async () => decir('primera parte'));
    expect(contexto.preguntar).not.toHaveBeenCalled();
    await fireEvent.press(detener);
    expect(voz.detener).toHaveBeenCalled();
    await act(async () => {
      decir('primera parte y segunda parte');
      terminar();
    });
    await waitFor(() => expect(contexto.preguntar).toHaveBeenCalled());
  });

  it('ejecuta la orden de agregar un contacto sin pasar por el modelo', async () => {
    const contexto = valor();
    const pantalla = await abrir(contexto);
    await fireEvent.changeText(
      pantalla.getByLabelText('Tu pregunta'),
      'Agregar a Gross como contacto de emergencia',
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Preguntar' }));
    expect(await pantalla.findByText(/teléfono de Gross/)).toBeTruthy();
    await fireEvent.changeText(
      pantalla.getByLabelText('Tu pregunta'),
      '8888 1234',
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Preguntar' }));
    expect(
      await pantalla.findByText(/Gross quedó como tu contacto/),
    ).toBeTruthy();
    expect(await AsyncStorage.getItem('anden.contactoConfianza')).toContain(
      '88881234',
    );
    expect(contexto.preguntar).not.toHaveBeenCalled();
  });

  it('muestra el viaje más próximo a un destino cuando se lo piden', async () => {
    const contexto = valor();
    const pantalla = await abrir(contexto);
    await fireEvent.changeText(
      pantalla.getByLabelText('Tu pregunta'),
      'Mostrarme el viaje más próximo a Boaco desde Managua',
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Preguntar' }));
    expect(
      await pantalla.findByText(/El próximo bus a Boaco sale de Managua/),
    ).toBeTruthy();
    expect(contexto.preguntar).not.toHaveBeenCalled();
  });

  it('antes de reservar pide confirmación y no compra solo', async () => {
    const pantalla = await abrir(valor());
    await fireEvent.changeText(
      pantalla.getByLabelText('Tu pregunta'),
      'Comprarme un boleto a Boaco',
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Preguntar' }));
    expect(
      await pantalla.findByText(/Puedo reservarte el asiento/),
    ).toBeTruthy();
    expect(pantalla.getByRole('button', { name: 'Sí, reservar' })).toBeTruthy();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'No, cancelar' }),
    );
    await waitFor(() =>
      expect(
        pantalla.queryByRole('button', { name: 'Sí, reservar' }),
      ).toBeNull(),
    );
  });

  it('lleva a otra pantalla cuando se lo piden', async () => {
    const alAbrirPantalla = jest.fn();
    const contexto = valor();
    const pantalla = await renderPantalla(
      <ContextoIA.Provider value={contexto}>
        <ContextoVoz.Provider value={vozFalsa().voz}>
          <Asistente
            alAbrirPantalla={alAbrirPantalla}
            alVolver={() => undefined}
          />
        </ContextoVoz.Provider>
      </ContextoIA.Provider>,
    );
    await fireEvent.changeText(
      pantalla.getByLabelText('Tu pregunta'),
      'Quiero enviar una encomienda',
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Preguntar' }));
    await waitFor(() =>
      expect(alAbrirPantalla).toHaveBeenCalledWith('encomienda'),
    );
    expect(
      await pantalla.findByText('Te llevo a enviar una encomienda.'),
    ).toBeTruthy();
    expect(contexto.preguntar).not.toHaveBeenCalled();
  });

  describe('conversación con herramientas', () => {
    function conversacion(json: object, parciales: object[] = []) {
      return jest.fn<NonNullable<ValorIA['conversar']>>(async (pedido) => {
        pedido.alHerramienta?.('buscarSalidas');
        for (const parcial of parciales) {
          pedido.alParcial?.(JSON.stringify(parcial));
        }
        return JSON.stringify(json);
      });
    }

    async function preguntar(contexto: ValorIA, texto = 'hola') {
      const pantalla = await abrir(contexto);
      await fireEvent.changeText(pantalla.getByLabelText('Tu pregunta'), texto);
      await fireEvent.press(
        pantalla.getByRole('button', { name: 'Preguntar' }),
      );
      return pantalla;
    }

    it('muestra la respuesta con la tarjeta de la salida real y las preguntas de seguimiento', async () => {
      const conversar = conversacion({
        ciudad: 'Boaco',
        mostrarBoletos: false,
        salidas: ['via_d1_0_0', 'via_inventada'],
        seguimientos: ['¿Y a Juigalpa?'],
        texto: 'Te sirve este bus.',
      });
      const pantalla = await preguntar(valor({ conversar }));
      expect(await pantalla.findByText('Te sirve este bus.')).toBeTruthy();
      expect(pantalla.getAllByTestId('tarjeta-salida-ia')).toHaveLength(1);
      expect(pantalla.getByTestId('ficha-ciudad-ia')).toBeTruthy();
      expect(
        pantalla.getByRole('button', { name: '¿Y a Juigalpa?' }),
      ).toBeTruthy();
    });

    it('manda los datos reales y las reglas, sin pasar por el modo sencillo', async () => {
      const contexto = valor({
        conversar: conversacion({ texto: 'Listo.' }),
      });
      await preguntar(contexto);
      await waitFor(() => expect(contexto.conversar).toHaveBeenCalledTimes(1));
      const pedido = jest.mocked(contexto.conversar!).mock.calls[0]![0];
      expect(JSON.parse(pedido.datosJson)).toHaveProperty('salidas');
      expect(pedido.instrucciones).toContain('Datos reales de Andén');
      expect(pedido.pregunta).toContain('Datos reales de Andén');
      expect(pedido.pregunta).toContain('Pregunta de la persona: hola');
      expect(contexto.preguntar).not.toHaveBeenCalled();
    });

    it('muestra lo que consulta el modelo mientras responde', async () => {
      let soltar: (valor: string) => void = () => undefined;
      const conversar = jest.fn<NonNullable<ValorIA['conversar']>>(
        (pedido) =>
          new Promise<string>((resolver) => {
            pedido.alHerramienta?.('misBoletos');
            soltar = resolver;
          }),
      );
      const pantalla = await preguntar(valor({ conversar }));
      expect(await pantalla.findByText('Revisando tus boletos…')).toBeTruthy();
      await act(async () => {
        soltar(JSON.stringify({ texto: 'Tenés un boleto.' }));
      });
      expect(await pantalla.findByText('Tenés un boleto.')).toBeTruthy();
      expect(pantalla.queryByText('Revisando tus boletos…')).toBeNull();
    });

    it('si el modelo falla cae en el modo sencillo y responde igual', async () => {
      const contexto = valor({
        conversar: jest.fn(async () => {
          throw new Error('fallo');
        }),
      });
      const pantalla = await preguntar(contexto);
      expect(
        await pantalla.findByText('El próximo bus a Boaco sale a las 2:30.'),
      ).toBeTruthy();
      expect(contexto.preguntar).toHaveBeenCalledTimes(1);
    });

    it('una ciudad de Descubrí pregunta qué visitar', async () => {
      const contexto = valor({ conversar: conversacion({ texto: 'Mucho.' }) });
      const pantalla = await abrir(contexto);
      await fireEvent.press(
        pantalla.getAllByRole('button', { name: /Boaco/ })[0]!,
      );
      await waitFor(() => expect(contexto.conversar).toHaveBeenCalled());
      expect(
        jest.mocked(contexto.conversar!).mock.calls[0]![0].pregunta,
      ).toContain('Pregunta de la persona: Qué visitar en Boaco');
    });

    it('nueva conversación borra lo hablado y olvida la sesión del modelo', async () => {
      const olvidar = jest.fn(async () => undefined);
      const pantalla = await preguntar(
        valor({ conversar: conversacion({ texto: 'Hola.' }), olvidar }),
      );
      await pantalla.findByText('Hola.');
      await fireEvent.press(
        pantalla.getByRole('button', { name: 'Nueva conversación' }),
      );
      expect(olvidar).toHaveBeenCalledTimes(1);
      expect(pantalla.queryByText('Hola.')).toBeNull();
    });
  });

  it('si llega con una pregunta inicial la envía sola', async () => {
    const contexto = valor();
    await renderPantalla(
      <ContextoIA.Provider value={contexto}>
        <ContextoVoz.Provider value={vozFalsa().voz}>
          <Asistente
            alVolver={() => undefined}
            preguntaInicial="¿Qué debo saber de este viaje?"
          />
        </ContextoVoz.Provider>
      </ContextoIA.Provider>,
    );
    await waitFor(() => expect(contexto.preguntar).toHaveBeenCalledTimes(1));
    expect(jest.mocked(contexto.preguntar).mock.calls[0]?.[1]).toBe(
      '¿Qué debo saber de este viaje?',
    );
  });

  it('el modelo recibe en el mensaje las salidas reales, incluida la de mañana, sin ids internos', async () => {
    const conversar = jest.fn<NonNullable<ValorIA['conversar']>>(async () =>
      JSON.stringify({ texto: 'Sí hay.' }),
    );
    const contexto = valor({ conversar });
    const pantalla = await abrir(contexto);
    await fireEvent.changeText(
      pantalla.getByLabelText('Tu pregunta'),
      'busca viajes próximos',
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Preguntar' }));
    await waitFor(() => expect(conversar).toHaveBeenCalledTimes(1));
    const pedido = conversar.mock.calls[0]![0];
    expect(pedido.pregunta).toContain('[1]');
    expect(pedido.pregunta).toContain('Salidas que coinciden');
    expect(pedido.pregunta).not.toMatch(/via_/);
    const snapshot = JSON.parse(pedido.datosJson);
    expect(snapshot.salidas.length).toBeGreaterThan(0);
    expect(snapshot.tarifas.length).toBeGreaterThan(0);
    expect(snapshot.personal[0]).toContain('usa la app como');
  });
});
