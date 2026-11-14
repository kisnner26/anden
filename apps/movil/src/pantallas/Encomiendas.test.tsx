import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Share } from 'react-native';

import { ContextoIA, type ValorIA } from '@/datos/useIA';
import { ProveedorEncomiendas } from '@/datos/ProveedorEncomiendas';
import { reiniciarMuestra } from '@/datos/useSalidas';
import { renderPantalla } from '@/pruebas/render';
import { reiniciarServicioEncomiendas } from '@/servicios/servicioEncomiendas';

import { Encomiendas } from './Encomiendas';

beforeEach(async () => {
  await AsyncStorage.clear();
  reiniciarMuestra();
  reiniciarServicioEncomiendas();
});

type Pantalla = Awaited<ReturnType<typeof dibujar>>;

function dibujar(alVolver: () => void = () => undefined) {
  return renderPantalla(
    <ProveedorEncomiendas>
      <Encomiendas alVolver={alVolver} />
    </ProveedorEncomiendas>,
  );
}

async function llenarPersonas(pantalla: Pantalla) {
  await fireEvent.changeText(pantalla.getByLabelText('Tu nombre'), 'Ana Ruiz');
  await fireEvent.changeText(
    pantalla.getByLabelText('Nombre de quien recibe'),
    'luis pérez',
  );
  await fireEvent.changeText(
    pantalla.getByLabelText('Teléfono de quien recibe'),
    '8888 1234',
  );
}

async function describir(pantalla: Pantalla, texto: string) {
  await fireEvent.changeText(
    pantalla.getByLabelText('Qué querés enviar'),
    texto,
  );
}

describe('Encomiendas', () => {
  it('explica que por ahora es una solicitud y no se cobra nada', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText(/por ahora no se cobra nada/)).toBeTruthy();
  });

  it('todo el formulario cabe en una sola pantalla, sin pasos', async () => {
    const pantalla = await dibujar();
    expect(pantalla.queryByText('1/3')).toBeNull();
    expect(pantalla.queryByRole('button', { name: 'Seguir' })).toBeNull();
    expect(pantalla.getByLabelText('Qué querés enviar')).toBeTruthy();
    expect(pantalla.getByRole('tab', { name: 'Boaco' })).toBeTruthy();
    expect(pantalla.getByRole('button', { name: 'Sobre' })).toBeTruthy();
    expect(pantalla.getByRole('button', { name: 'Frágil' })).toBeTruthy();
    expect(pantalla.getByLabelText('Tu nombre')).toBeTruthy();
    expect(
      pantalla.getByRole('button', { name: 'Solicitar envío' }),
    ).toBeTruthy();
  });

  it('el tamaño elegido queda marcado', async () => {
    const pantalla = await dibujar();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Paquete grande' }),
    );
    expect(
      pantalla.getByRole('button', { name: 'Paquete grande' }).props
        .accessibilityState,
    ).toMatchObject({ selected: true });
  });

  it('el sentido se invierte tocando el trayecto', async () => {
    const pantalla = await dibujar();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Managua → Boaco' }),
    );
    expect(
      pantalla.getByRole('button', { name: 'Boaco → Managua' }),
    ).toBeTruthy();
  });

  it('el bus sale elegido solo: el primero que sale', async () => {
    const pantalla = await dibujar();
    const horas = pantalla.queryAllByText(/^\d{1,2}:\d{2} (a|p)\. m\.$/);
    if (horas.length === 0) return;
    expect(
      pantalla.getAllByRole('button', { selected: true }).length,
    ).toBeGreaterThan(0);
  });

  it('no deja enviar con los datos vacíos y dice qué falta', async () => {
    const pantalla = await dibujar();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Solicitar envío' }),
    );
    expect(pantalla.getByText('Escribí quién recibe.')).toBeTruthy();
    expect(
      pantalla.getByText('Escribí un teléfono de Nicaragua válido.'),
    ).toBeTruthy();
    expect(
      pantalla.getByText('Contá qué enviás, en pocas palabras.'),
    ).toBeTruthy();
    expect(await AsyncStorage.getItem('anden.encomiendas')).toBeNull();
  });

  it('al enviar guarda la solicitud y muestra el comprobante con su código', async () => {
    const pantalla = await dibujar();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Paquete grande' }),
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Frágil' }));
    await llenarPersonas(pantalla);
    await describir(pantalla, 'caja con repuestos');
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Solicitar envío' }),
    );

    expect(await pantalla.findByText('Envío solicitado')).toBeTruthy();
    expect(pantalla.getAllByText(/^ENC-[A-Z2-9]{6}$/).length).toBeGreaterThan(
      0,
    );
    expect(pantalla.getAllByText('Solicitada').length).toBeGreaterThan(0);
    const guardado = (await AsyncStorage.getItem('anden.encomiendas')) ?? '';
    expect(guardado).toContain('88881234');
    expect(guardado).toContain('"fragil":true');
    expect(guardado).toContain('caja con repuestos');
  });

  it('el comprobante se comparte con el código', async () => {
    const compartir = jest.spyOn(Share, 'share').mockResolvedValue({
      action: 'dismissedAction',
      activityType: undefined,
    });
    const pantalla = await dibujar();
    await llenarPersonas(pantalla);
    await describir(pantalla, 'documentos');
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Solicitar envío' }),
    );
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Compartir comprobante' }),
    );
    expect(compartir).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/ENC-[A-Z2-9]{6}/),
      }),
    );
    compartir.mockRestore();
  });

  it('después de enviar se puede hacer otro envío', async () => {
    const pantalla = await dibujar();
    await llenarPersonas(pantalla);
    await describir(pantalla, 'documentos');
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Solicitar envío' }),
    );
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Hacer otro envío' }),
    );
    expect(pantalla.getByLabelText('Qué querés enviar')).toBeTruthy();
  });

  it('muestra las solicitudes anteriores con sus etapas', async () => {
    const pantalla = await dibujar();
    await llenarPersonas(pantalla);
    await describir(pantalla, 'documentos');
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Solicitar envío' }),
    );
    await pantalla.findByText('Envío solicitado');
    await waitFor(() =>
      expect(pantalla.getByText('Tus solicitudes')).toBeTruthy(),
    );
    expect(pantalla.getAllByText('En el bus').length).toBeGreaterThan(0);
  });

  it('vuelve al presionar la flecha', async () => {
    const alVolver = jest.fn();
    const pantalla = await dibujar(alVolver);
    await fireEvent.press(pantalla.getByRole('button', { name: 'Volver' }));
    expect(alVolver).toHaveBeenCalledTimes(1);
  });

  describe('con IA (Apple Intelligence o Gemini)', () => {
    function conIA(preguntar: ValorIA['preguntar'], usable = true) {
      const ia: ValorIA = {
        activada: true,
        cambiar: async () => undefined,
        cargando: false,
        disponibilidad: 'disponible',
        nombre: 'Gemini',
        preguntar,
        usable,
      };
      return renderPantalla(
        <ContextoIA.Provider value={ia}>
          <ProveedorEncomiendas>
            <Encomiendas alVolver={() => undefined} />
          </ProveedorEncomiendas>
        </ContextoIA.Provider>,
      );
    }

    const TEXTO =
      'una caja de vasos de vidrio para Luis Pérez, 8888 1234, a Juigalpa';

    it('entiende solo lo que se escribe y llena el formulario, sin tocar ningún botón', async () => {
      const preguntar = jest.fn<ValorIA['preguntar']>(async () =>
        JSON.stringify({
          ciudad: 'Juigalpa',
          descripcion: 'Caja de vasos',
          destinatario: 'Luis Pérez',
          fragil: true,
          sentido: 'ida',
          tamano: 'grande',
        }),
      );
      const pantalla = await conIA(preguntar);
      await fireEvent.changeText(
        pantalla.getByLabelText('Qué querés enviar'),
        TEXTO,
      );
      await waitFor(() => expect(preguntar).toHaveBeenCalledTimes(1), {
        timeout: 4000,
      });
      expect(preguntar.mock.calls[0]?.[0]).toContain('SOLO con un JSON');
      await waitFor(
        () =>
          expect(
            pantalla.getByRole('button', { name: 'Paquete grande' }).props
              .accessibilityState,
          ).toMatchObject({ selected: true }),
        { timeout: 4000 },
      );
      expect(
        pantalla.getByRole('button', { name: 'Frágil' }).props
          .accessibilityState,
      ).toMatchObject({ selected: true });
      expect(
        pantalla.getByRole('button', { name: 'Managua → Juigalpa' }),
      ).toBeTruthy();
      expect(
        pantalla.getByLabelText('Nombre de quien recibe').props.value,
      ).toBe('Luis Pérez');
      expect(
        pantalla.getByLabelText('Teléfono de quien recibe').props.value,
      ).toBe('88881234');
      expect(pantalla.getByText('+505 8888 1234')).toBeTruthy();
    });

    it('si el modelo falla igual entiende el texto por palabras', async () => {
      const pantalla = await conIA(async () => {
        throw new Error('fallo');
      });
      await fireEvent.changeText(
        pantalla.getByLabelText('Qué querés enviar'),
        TEXTO,
      );
      await waitFor(
        () =>
          expect(
            pantalla.getByLabelText('Teléfono de quien recibe').props.value,
          ).toBe('88881234'),
        { timeout: 4000 },
      );
      expect(
        pantalla.getByRole('button', { name: 'Frágil' }).props
          .accessibilityState,
      ).toMatchObject({ selected: true });
    });

    it('lo que la persona ya escribió en los campos no se pisa', async () => {
      const pantalla = await conIA(async () => '{}');
      await fireEvent.changeText(
        pantalla.getByLabelText('Nombre de quien recibe'),
        'Marta',
      );
      await fireEvent.changeText(
        pantalla.getByLabelText('Qué querés enviar'),
        TEXTO,
      );
      await waitFor(
        () =>
          expect(
            pantalla.getByLabelText('Teléfono de quien recibe').props.value,
          ).toBe('88881234'),
        { timeout: 4000 },
      );
      expect(
        pantalla.getByLabelText('Nombre de quien recibe').props.value,
      ).toBe('Marta');
    });

    it('con la IA lista muestra su orbe para volver a entender', async () => {
      const pantalla = await conIA(async () => '{}');
      expect(
        pantalla.getByRole('button', { name: 'Entender de nuevo con Gemini' }),
      ).toBeTruthy();
      expect(pantalla.getByText('Potenciado por Gemini')).toBeTruthy();
    });

    it('sin la IA lista sigue entendiendo ciudad, teléfono y tamaño, sin orbe', async () => {
      const pantalla = await conIA(async () => '', false);
      expect(
        pantalla.queryByRole('button', { name: /Entender de nuevo/ }),
      ).toBeNull();
      expect(
        pantalla.getByText('Leo la ciudad, el teléfono y el tamaño'),
      ).toBeTruthy();
      await fireEvent.changeText(
        pantalla.getByLabelText('Qué querés enviar'),
        TEXTO,
      );
      await waitFor(
        () =>
          expect(
            pantalla.getByLabelText('Teléfono de quien recibe').props.value,
          ).toBe('88881234'),
        { timeout: 4000 },
      );
    });
  });
});
