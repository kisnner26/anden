import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  launchImageLibraryAsync,
  requestMediaLibraryPermissionsAsync,
} from 'expo-image-picker';

import { guardarFoto } from './almacenFotos';
import { elegirFotoDeGaleria } from './fotos';

jest.mock('./almacenFotos', () => ({
  guardarFoto: jest.fn(() => 'fotos/copia.jpg'),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

const permiso = requestMediaLibraryPermissionsAsync as unknown as {
  mockResolvedValue: (valor: unknown) => void;
};
const galeria = launchImageLibraryAsync as unknown as {
  mockResolvedValue: (valor: unknown) => void;
};

beforeEach(() => {
  jest.clearAllMocks();
  permiso.mockResolvedValue({ granted: true });
});

describe('elegirFotoDeGaleria', () => {
  it('devuelve la foto elegida', async () => {
    galeria.mockResolvedValue({
      assets: [{ uri: 'file:///foto.jpg' }],
      canceled: false,
    });
    expect(await elegirFotoDeGaleria()).toEqual({
      tipo: 'elegida',
      uri: 'fotos/copia.jpg',
    });
    expect(guardarFoto).toHaveBeenCalledWith('file:///foto.jpg');
  });

  it('si no se puede copiar a los documentos conserva la ruta original', async () => {
    (
      guardarFoto as unknown as {
        mockImplementationOnce: (f: () => never) => void;
      }
    ).mockImplementationOnce(() => {
      throw new Error('sin espacio');
    });
    galeria.mockResolvedValue({
      assets: [{ uri: 'file:///foto.jpg' }],
      canceled: false,
    });
    expect(await elegirFotoDeGaleria()).toEqual({
      tipo: 'elegida',
      uri: 'file:///foto.jpg',
    });
  });

  it('avisa si la persona cierra la galería sin elegir', async () => {
    galeria.mockResolvedValue({ assets: null, canceled: true });
    expect(await elegirFotoDeGaleria()).toEqual({ tipo: 'cancelada' });
  });

  it('avisa si no hay permiso y no abre la galería', async () => {
    permiso.mockResolvedValue({ granted: false });
    expect(await elegirFotoDeGaleria()).toEqual({ tipo: 'sin-permiso' });
    expect(launchImageLibraryAsync).not.toHaveBeenCalled();
  });
});
