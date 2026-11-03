import { expect, it, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';
import type { Terminal } from '@anden/dominio';

jest.mock('./ubicacion', () => ({
  obtenerUbicacionActual: jest.fn(),
}));

import { obtenerUbicacionActual } from './ubicacion';
import { useUbicacionCercana } from './useUbicacionCercana';

const TERMINALES: Terminal[] = [
  {
    andenes: 1,
    ciudad: 'Managua',
    codigo: 'MGA',
    coordenadas: { lat: 12.13, lng: -86.25 },
    id: 'managua',
    nombre: 'Terminal Managua',
  },
];

it('elige la terminal y conserva solo el resultado derivado', async () => {
  jest.mocked(obtenerUbicacionActual).mockResolvedValue({
    estado: 'otorgado',
    punto: { lat: 12.131, lng: -86.251 },
  });
  const alSeleccionar = jest.fn();
  const { result } = await renderHook(() =>
    useUbicacionCercana(TERMINALES, alSeleccionar),
  );

  await act(() => result.current.resolver());

  expect(alSeleccionar).toHaveBeenCalledWith('managua');
  expect(result.current.estado).toEqual({
    distanciaKm: expect.any(Number),
    nombre: 'Terminal Managua',
    tipo: 'confirmada',
  });
  expect(result.current.estado).not.toHaveProperty('punto');
});

it('presenta el permiso denegado sin intentar elegir terminal', async () => {
  jest
    .mocked(obtenerUbicacionActual)
    .mockResolvedValue({ estado: 'denegado' });
  const alSeleccionar = jest.fn();
  const { result } = await renderHook(() =>
    useUbicacionCercana(TERMINALES, alSeleccionar),
  );

  await act(() => result.current.resolver());

  expect(result.current.estado).toEqual({ tipo: 'denegada' });
  expect(alSeleccionar).not.toHaveBeenCalled();
});
