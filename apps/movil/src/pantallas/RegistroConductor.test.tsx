import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

jest.mock('@/datos/biometria', () => ({
  autenticar: jest.fn(async () => true),
  consultarBiometria: jest.fn(async () => ({
    disponible: true,
    tipo: 'rostro',
  })),
}));
jest.mock('@/datos/fotos', () => ({
  elegirFotoDeCedula: jest.fn(async () => ({
    tipo: 'elegida',
    uri: 'file:///cedula.jpg',
  })),
}));

import { autenticar } from '@/datos/biometria';
import { elegirFotoDeCedula } from '@/datos/fotos';
import { ProveedorSesion } from '@/datos/ProveedorSesion';
import { renderPantalla } from '@/pruebas/render';

import { RegistroConductor } from './RegistroConductor';

type Pantalla = Awaited<ReturnType<typeof dibujar>>;

beforeEach(async () => {
  jest.clearAllMocks();
  jest.mocked(autenticar).mockResolvedValue(true);
  jest.mocked(elegirFotoDeCedula).mockResolvedValue({
    tipo: 'elegida',
    uri: 'file:///cedula.jpg',
  });
  await AsyncStorage.clear();
});

function dibujar(alVolver: () => void = () => undefined) {
  return renderPantalla(
    <ProveedorSesion>
      <RegistroConductor alVolver={alVolver} />
    </ProveedorSesion>,
  );
}

async function seguir(pantalla: Pantalla) {
  await fireEvent.press(pantalla.getByRole('button', { name: 'Seguir' }));
}

async function paso1(pantalla: Pantalla) {
  await fireEvent.changeText(pantalla.getByLabelText('Nombre'), 'Iván');
  await fireEvent.changeText(pantalla.getByLabelText('Apellido'), 'Obando');
  await fireEvent.changeText(pantalla.getByLabelText('Teléfono'), '8888 1234');
  await fireEvent.changeText(pantalla.getByLabelText('Usuario'), 'ivan.obando');
  await fireEvent.changeText(
    pantalla.getByLabelText('Contraseña'),
    'Clave2026x',
  );
  await seguir(pantalla);
}

describe('RegistroConductor', () => {
  it('empieza en el paso 1 y exige los datos personales', async () => {
    const pantalla = await dibujar();
    expect(await pantalla.findByText(/1\/3 · Tus datos/)).toBeTruthy();
    await seguir(pantalla);
    expect(pantalla.getByText('Escribí tu nombre.')).toBeTruthy();
    expect(pantalla.getByText('Escribí tu apellido.')).toBeTruthy();
  });

  it('sin cuenta pide usuario y contraseña en el primer paso', async () => {
    const pantalla = await dibujar();
    await fireEvent.changeText(pantalla.getByLabelText('Nombre'), 'Iván');
    await fireEvent.changeText(pantalla.getByLabelText('Apellido'), 'Obando');
    await fireEvent.changeText(
      pantalla.getByLabelText('Teléfono'),
      '8888 1234',
    );
    await seguir(pantalla);
    expect(
      await pantalla.findByText(/Escribí de 3 a 20 letras sin tilde/),
    ).toBeTruthy();
    expect(pantalla.getByText(/Usá al menos 8 caracteres/)).toBeTruthy();
    expect(pantalla.queryByText(/2\/3/)).toBeNull();
  });

  it('la cédula y las dos fotos son obligatorias para pasar del paso 2', async () => {
    const pantalla = await dibujar();
    await paso1(pantalla);
    await seguir(pantalla);
    expect(
      pantalla.getByText(
        'Escribí la cédula completa, por ejemplo 001-010190-0001A.',
      ),
    ).toBeTruthy();
    expect(
      pantalla.getByText('Falta la foto del frente de la cédula.'),
    ).toBeTruthy();
    expect(
      pantalla.getByText('Falta la foto del dorso de la cédula.'),
    ).toBeTruthy();
    expect(pantalla.queryByText(/3\/3/)).toBeNull();
  });

  it('la cédula se escribe con su formato y se valida', async () => {
    const pantalla = await dibujar();
    await paso1(pantalla);
    await fireEvent.changeText(
      pantalla.getByLabelText('Número de cédula'),
      '0010101900001a',
    );
    expect(pantalla.getByLabelText('Número de cédula').props.value).toBe(
      '001-010190-0001A',
    );
  });

  it('elige las fotos desde la galería, nunca con la cámara', async () => {
    const pantalla = await dibujar();
    await paso1(pantalla);
    await fireEvent.press(
      pantalla.getByRole('button', {
        name: /^Frente de la cédula\. Elegir la foto/,
      }),
    );
    await fireEvent.press(
      pantalla.getByRole('button', {
        name: /^Dorso de la cédula\. Elegir la foto/,
      }),
    );
    expect(elegirFotoDeCedula).toHaveBeenCalledTimes(2);
    expect(pantalla.getByText(/Andén no abre la cámara/)).toBeTruthy();
  });

  it('avisa si no hay permiso para ver las fotos', async () => {
    jest.mocked(elegirFotoDeCedula).mockResolvedValue({ tipo: 'sin-permiso' });
    const pantalla = await dibujar();
    await paso1(pantalla);
    await fireEvent.press(
      pantalla.getByRole('button', { name: /^Frente de la cédula/ }),
    );
    expect(
      await pantalla.findByText(/no tiene permiso para ver tus fotos/),
    ).toBeTruthy();
  });

  it('flujo completo: no se envía sin confirmar la identidad y al enviar queda en revisión', async () => {
    jest.mocked(autenticar).mockResolvedValueOnce(false);
    const pantalla = await dibujar();
    await paso1(pantalla);
    await fireEvent.changeText(
      pantalla.getByLabelText('Número de cédula'),
      '001-010190-0001A',
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: /^Frente de la cédula/ }),
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: /^Dorso de la cédula/ }),
    );
    await seguir(pantalla);

    expect(
      pantalla.getByRole('button', { name: 'Enviar solicitud' }).props
        .accessibilityState,
    ).toMatchObject({ disabled: true });
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Confirmar con Face ID o huella' }),
    );
    expect(
      await pantalla.findByText(
        'No pudimos confirmar que sos vos. Probá de nuevo.',
      ),
    ).toBeTruthy();

    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Confirmar con Face ID o huella' }),
    );
    expect(await pantalla.findByText('Identidad confirmada')).toBeTruthy();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Enviar solicitud' }),
    );

    expect(await pantalla.findByText('Solicitud enviada')).toBeTruthy();
    expect(pantalla.getByText('En revisión')).toBeTruthy();
    const guardado =
      (await AsyncStorage.getItem('anden.solicitud-conductor')) ?? '';
    expect(guardado).toContain('001-010190-0001A');
    expect(guardado).toContain('"estado":"en-revision"');
    // la cédula no se muestra completa en pantalla
    expect(pantalla.queryByText(/001-010190-0001A/)).toBeNull();
  });

  it('una solicitud ya enviada se ve en revisión y se puede descartar', async () => {
    await AsyncStorage.setItem(
      'anden.solicitud-conductor',
      JSON.stringify({
        apellido: 'Obando',
        biometriaConfirmada: true,
        cedula: '001-010190-0001A',
        cedulaDorsoUri: 'file:///d.jpg',
        cedulaFrenteUri: 'file:///f.jpg',
        creadaEn: '2026-11-13T10:00:00Z',
        estado: 'en-revision',
        nombre: 'Iván',
        telefono: '88881234',
      }),
    );
    const pantalla = await dibujar();
    expect(await pantalla.findByText('Solicitud enviada')).toBeTruthy();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Descartar la solicitud' }),
    );
    await waitFor(() =>
      expect(pantalla.getByText(/1\/3 · Tus datos/)).toBeTruthy(),
    );
    expect(await AsyncStorage.getItem('anden.solicitud-conductor')).toBeNull();
  });

  it('vuelve al presionar la flecha', async () => {
    const alVolver = jest.fn();
    const pantalla = await dibujar(alVolver);
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Volver' }),
    );
    expect(alVolver).toHaveBeenCalledTimes(1);
  });
});
