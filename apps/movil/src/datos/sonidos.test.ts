import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockReproductor = {
  play: jest.fn(),
  remove: jest.fn(),
  seekTo: jest.fn<(segundos: number) => Promise<void>>(async () => undefined),
};
const mockCrear = jest.fn<(fuente: number) => typeof mockReproductor>(
  () => mockReproductor,
);
const mockModo = jest.fn<(modo: object) => Promise<void>>(
  async () => undefined,
);

jest.mock('expo-audio', () => ({
  createAudioPlayer: (fuente: number) => mockCrear(fuente),
  setAudioModeAsync: (modo: object) => mockModo(modo),
}));

import { liberarSonidos, reproducirSonido } from './sonidos';

beforeEach(() => {
  jest.clearAllMocks();
  liberarSonidos();
});

describe('sonidos', () => {
  it('configura el audio para respetar el modo silencio', async () => {
    await reproducirSonido('bocina');
    expect(mockModo).toHaveBeenCalledWith({
      interruptionMode: 'mixWithOthers',
      playsInSilentMode: false,
    });
  });

  it('reproduce desde el inicio y reutiliza el reproductor', async () => {
    await reproducirSonido('arranque');
    await reproducirSonido('arranque');
    expect(mockCrear).toHaveBeenCalledTimes(1);
    expect(mockReproductor.seekTo).toHaveBeenCalledWith(0);
    expect(mockReproductor.play).toHaveBeenCalledTimes(2);
  });

  it('no lanza error si el audio falla', async () => {
    mockCrear.mockImplementationOnce(() => {
      throw new Error('sin audio');
    });
    await expect(reproducirSonido('salida')).resolves.toBeUndefined();
  });

  it('libera los reproductores', async () => {
    await reproducirSonido('bocina');
    liberarSonidos();
    expect(mockReproductor.remove).toHaveBeenCalled();
  });
});
