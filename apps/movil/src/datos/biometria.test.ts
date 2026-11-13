import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockHardware = jest.fn<() => Promise<boolean>>();
const mockRegistrada = jest.fn<() => Promise<boolean>>();
const mockTipos = jest.fn<() => Promise<number[]>>();
const mockAutenticar =
  jest.fn<(opciones: object) => Promise<{ success: boolean }>>();

jest.mock('expo-local-authentication', () => ({
  AuthenticationType: { FACIAL_RECOGNITION: 2, FINGERPRINT: 1 },
  authenticateAsync: (opciones: object) => mockAutenticar(opciones),
  hasHardwareAsync: () => mockHardware(),
  isEnrolledAsync: () => mockRegistrada(),
  supportedAuthenticationTypesAsync: () => mockTipos(),
}));

import {
  VENTANA_VERIFICACION_MS,
  autenticar,
  consultarBiometria,
  olvidarVerificacion,
  verificacionVigente,
  verificarConductor,
} from './biometria';

beforeEach(() => {
  jest.resetAllMocks();
  olvidarVerificacion();
});

describe('consultarBiometria', () => {
  it('reconoce Face ID', async () => {
    mockHardware.mockResolvedValue(true);
    mockRegistrada.mockResolvedValue(true);
    mockTipos.mockResolvedValue([2]);
    expect(await consultarBiometria()).toEqual({
      disponible: true,
      tipo: 'rostro',
    });
  });

  it('reconoce la huella', async () => {
    mockHardware.mockResolvedValue(true);
    mockRegistrada.mockResolvedValue(true);
    mockTipos.mockResolvedValue([1]);
    expect(await consultarBiometria()).toEqual({
      disponible: true,
      tipo: 'huella',
    });
  });

  it('no está disponible si no hay nada registrado', async () => {
    mockHardware.mockResolvedValue(true);
    mockRegistrada.mockResolvedValue(false);
    mockTipos.mockResolvedValue([2]);
    expect((await consultarBiometria()).disponible).toBe(false);
  });

  it('no está disponible si el módulo falla', async () => {
    mockHardware.mockRejectedValue(new Error('sin módulo'));
    expect(await consultarBiometria()).toEqual({
      disponible: false,
      tipo: 'ninguna',
    });
  });
});

describe('autenticar', () => {
  it('devuelve verdadero si la persona se identifica', async () => {
    mockAutenticar.mockResolvedValue({ success: true });
    expect(await autenticar('Abrí Andén')).toBe(true);
    expect(mockAutenticar).toHaveBeenCalledWith({
      promptMessage: 'Abrí Andén',
    });
  });

  it('devuelve falso si cancela', async () => {
    mockAutenticar.mockResolvedValue({ success: false });
    expect(await autenticar('Abrí Andén')).toBe(false);
  });

  it('devuelve falso si el módulo lanza un error', async () => {
    mockAutenticar.mockRejectedValue(new Error('fallo'));
    expect(await autenticar('Abrí Andén')).toBe(false);
  });
});

describe('verificarConductor', () => {
  it('sin verificación previa la pide y la recuerda si sale bien', async () => {
    mockAutenticar.mockResolvedValue({ success: true });
    expect(verificacionVigente()).toBe(false);
    expect(await verificarConductor('entrar')).toBe(true);
    expect(verificacionVigente()).toBe(true);
    expect(mockAutenticar).toHaveBeenCalledTimes(1);
  });

  it('con una verificación reciente no vuelve a pedirla', async () => {
    mockAutenticar.mockResolvedValue({ success: true });
    await verificarConductor('entrar');
    expect(await verificarConductor('otra vez')).toBe(true);
    expect(mockAutenticar).toHaveBeenCalledTimes(1);
  });

  it('si se exige, la pide aunque haya una reciente', async () => {
    mockAutenticar.mockResolvedValue({ success: true });
    await verificarConductor('entrar');
    await verificarConductor('iniciar el viaje', true);
    expect(mockAutenticar).toHaveBeenCalledTimes(2);
  });

  it('si falla no queda verificado', async () => {
    mockAutenticar.mockResolvedValue({ success: false });
    expect(await verificarConductor('entrar')).toBe(false);
    expect(verificacionVigente()).toBe(false);
  });

  it('la verificación se vence pasado el tiempo', async () => {
    mockAutenticar.mockResolvedValue({ success: true });
    await verificarConductor('entrar');
    expect(
      verificacionVigente(Date.now() + VENTANA_VERIFICACION_MS + 1000),
    ).toBe(false);
  });
});
