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

import { autenticar, consultarBiometria } from './biometria';

beforeEach(() => {
  jest.resetAllMocks();
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
