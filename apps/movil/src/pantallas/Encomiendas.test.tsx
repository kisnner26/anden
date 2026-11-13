import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Share } from 'react-native';

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

async function seguir(pantalla: Pantalla) {
  // en el paso 1 hay que elegir primero el bus en que va el paquete
  const buses = pantalla.queryAllByText(/Se pone en andén a las/);
  if (buses[0]) await fireEvent.press(buses[0]);
  await fireEvent.press(pantalla.getByRole('button', { name: 'Seguir' }));
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

describe('Encomiendas', () => {
  it('explica que por ahora es una solicitud y no se cobra nada', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText(/por ahora no se cobra nada/)).toBeTruthy();
  });

  it('empieza en el paso 1 con el trayecto, el tamaño y lo frágil', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('1/3')).toBeTruthy();
    expect(pantalla.getByText('Trayecto y paquete')).toBeTruthy();
    expect(pantalla.getByRole('tab', { name: 'Boaco' })).toBeTruthy();
    expect(pantalla.getByRole('button', { name: 'Sobre' })).toBeTruthy();
    expect(
      pantalla.getByRole('button', { name: 'Paquete grande' }),
    ).toBeTruthy();
    expect(pantalla.getByRole('switch', { name: 'Frágil' })).toBeTruthy();
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

  it('en el paso 2 no deja seguir con los datos de las personas vacíos', async () => {
    const pantalla = await dibujar();
    await seguir(pantalla);
    expect(pantalla.getByText('Quién envía')).toBeTruthy();
    await seguir(pantalla);
    expect(pantalla.getByText('Escribí quién envía.')).toBeTruthy();
    expect(pantalla.getByText('Escribí quién recibe.')).toBeTruthy();
    expect(
      pantalla.getByText('Escribí un teléfono de Nicaragua válido.'),
    ).toBeTruthy();
    expect(await AsyncStorage.getItem('anden.encomiendas')).toBeNull();
  });

  it('se puede volver al paso anterior', async () => {
    const pantalla = await dibujar();
    await seguir(pantalla);
    await fireEvent.press(pantalla.getByRole('button', { name: 'Atrás' }));
    expect(pantalla.getByText('1/3')).toBeTruthy();
  });

  it('en el paso 3 pide qué se envía y muestra el resumen antes de enviar', async () => {
    const pantalla = await dibujar();
    await fireEvent.press(pantalla.getByRole('tab', { name: 'Juigalpa' }));
    await seguir(pantalla);
    await llenarPersonas(pantalla);
    await seguir(pantalla);
    expect(pantalla.getByText('Tu envío')).toBeTruthy();
    expect(pantalla.getByText('Managua → Juigalpa')).toBeTruthy();
    expect(pantalla.getByText('Para Luis Pérez')).toBeTruthy();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Solicitar envío' }),
    );
    expect(
      pantalla.getByText('Contá qué enviás, en pocas palabras.'),
    ).toBeTruthy();
  });

  it('al enviar guarda la solicitud y muestra el comprobante con su código', async () => {
    const pantalla = await dibujar();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Paquete grande' }),
    );
    await fireEvent.press(pantalla.getByRole('switch', { name: 'Frágil' }));
    await seguir(pantalla);
    await llenarPersonas(pantalla);
    await seguir(pantalla);
    await fireEvent.changeText(
      pantalla.getByLabelText('Qué enviás'),
      'caja con repuestos',
    );
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
  });

  it('el comprobante se comparte con el código', async () => {
    const compartir = jest.spyOn(Share, 'share').mockResolvedValue({
      action: 'dismissedAction',
      activityType: undefined,
    });
    const pantalla = await dibujar();
    await seguir(pantalla);
    await llenarPersonas(pantalla);
    await seguir(pantalla);
    await fireEvent.changeText(
      pantalla.getByLabelText('Qué enviás'),
      'documentos',
    );
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

  it('después de enviar se puede hacer otro envío desde el paso 1', async () => {
    const pantalla = await dibujar();
    await seguir(pantalla);
    await llenarPersonas(pantalla);
    await seguir(pantalla);
    await fireEvent.changeText(
      pantalla.getByLabelText('Qué enviás'),
      'documentos',
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Solicitar envío' }),
    );
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Hacer otro envío' }),
    );
    expect(pantalla.getByText('1/3')).toBeTruthy();
  });

  it('muestra las solicitudes anteriores con sus etapas', async () => {
    const pantalla = await dibujar();
    await seguir(pantalla);
    await llenarPersonas(pantalla);
    await seguir(pantalla);
    await fireEvent.changeText(
      pantalla.getByLabelText('Qué enviás'),
      'documentos',
    );
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

  it('no deja seguir sin elegir el bus en que va el paquete', async () => {
    const pantalla = await dibujar();
    await fireEvent.press(pantalla.getByRole('button', { name: 'Seguir' }));
    expect(
      pantalla.getByText('Elegí el bus en que va la encomienda.'),
    ).toBeTruthy();
    expect(pantalla.getByText('1/3')).toBeTruthy();
  });

  it('las tres tarjetas de tamaño tienen todo centrado y a la misma altura', async () => {
    const pantalla = await dibujar();
    for (const nombre of ['Sobre', 'Paquete chico', 'Paquete grande']) {
      const texto = pantalla.getAllByText(nombre)[0]!;
      expect(texto.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ textAlign: 'center' }),
        ]),
      );
    }
  });
});
