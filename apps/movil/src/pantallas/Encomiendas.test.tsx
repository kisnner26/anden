import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { Encomiendas } from './Encomiendas';

beforeEach(async () => {
  await AsyncStorage.clear();
});

function dibujar(alVolver: () => void = () => undefined) {
  return renderPantalla(<Encomiendas alVolver={alVolver} />);
}

async function llenar(pantalla: Awaited<ReturnType<typeof dibujar>>) {
  await fireEvent.changeText(
    pantalla.getByLabelText('Quién envía'),
    'Ana Ruiz',
  );
  await fireEvent.changeText(
    pantalla.getByLabelText('Quién recibe'),
    'luis pérez',
  );
  await fireEvent.changeText(
    pantalla.getByLabelText('Teléfono de quien recibe'),
    '8888 1234',
  );
  await fireEvent.changeText(
    pantalla.getByLabelText('Qué enviás'),
    'caja con repuestos',
  );
}

describe('Encomiendas', () => {
  it('explica que por ahora es una solicitud y no se cobra nada', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText(/por ahora no se cobra nada/)).toBeTruthy();
    expect(
      pantalla.getByText(/solicitud guardada en tu teléfono/),
    ).toBeTruthy();
  });

  it('ofrece los cuatro sentidos de los corredores', async () => {
    const pantalla = await dibujar();
    expect(
      pantalla.getByRole('button', { name: 'Boaco → Managua' }),
    ).toBeTruthy();
    expect(
      pantalla.getByRole('button', { name: 'Managua → Juigalpa' }),
    ).toBeTruthy();
  });

  it('marca los campos vacíos y no guarda nada', async () => {
    const pantalla = await dibujar();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Solicitar envío' }),
    );
    expect(pantalla.getByText('Escribí quién envía.')).toBeTruthy();
    expect(
      pantalla.getByText('Escribí un teléfono de Nicaragua válido.'),
    ).toBeTruthy();
    expect(await AsyncStorage.getItem('anden.encomiendas')).toBeNull();
  });

  it('guarda la solicitud con su código y la muestra en la lista', async () => {
    const pantalla = await dibujar();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Managua → Juigalpa' }),
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Paquete grande' }),
    );
    await llenar(pantalla);
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Solicitar envío' }),
    );

    expect(await pantalla.findByText('Tus solicitudes')).toBeTruthy();
    expect(pantalla.getByText(/^ENC-[A-Z2-9]{6}$/)).toBeTruthy();
    expect(
      pantalla.getByText('Paquete grande · caja con repuestos'),
    ).toBeTruthy();
    expect(pantalla.getByText('Para Luis Pérez')).toBeTruthy();
    expect(pantalla.getByText('Solicitada')).toBeTruthy();
    expect(pantalla.getByText('Solicitud enviada')).toBeTruthy();
    expect(await AsyncStorage.getItem('anden.encomiendas')).toContain(
      '88881234',
    );
  });

  it('después de solicitar deja el formulario vacío', async () => {
    const pantalla = await dibujar();
    await llenar(pantalla);
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Solicitar envío' }),
    );
    await waitFor(() =>
      expect(pantalla.getByLabelText('Quién envía').props.value).toBe(''),
    );
  });

  it('muestra las solicitudes que ya había guardadas', async () => {
    await AsyncStorage.setItem(
      'anden.encomiendas',
      JSON.stringify([
        {
          codigo: 'ENC-ABC234',
          creadaEn: new Date().toISOString(),
          descripcion: 'sobre con documentos',
          destinatario: 'Rosa Mena',
          destino: 'Managua',
          estado: 'solicitada',
          id: 'enc_1',
          origen: 'Boaco',
          remitente: 'Ana',
          tamano: 'sobre',
          telefonoDestinatario: '88881234',
        },
      ]),
    );
    const pantalla = await dibujar();
    expect(await pantalla.findByText('ENC-ABC234')).toBeTruthy();
  });

  it('vuelve con la flecha', async () => {
    const alVolver = jest.fn();
    const pantalla = await dibujar(alVolver);
    await fireEvent.press(pantalla.getByRole('button', { name: 'Volver' }));
    expect(alVolver).toHaveBeenCalledTimes(1);
  });
});
