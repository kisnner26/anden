import { expect, it, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';
import type { Terminal } from '@anden/dominio';

jest.mock('./ubicacion', () => ({
  obtenerUbicacionActual: jest.fn(),
}));

import {
  obtenerUbicacionActual,
  type ResultadoUbicacion,
} from './ubicacion';
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

it('expone la espera mientras el proveedor busca la posición', async () => {
  let completar: (resultado: ResultadoUbicacion) => void = () => undefined;
  jest.mocked(obtenerUbicacionActual).mockImplementation(
    () =>
      new Promise<ResultadoUbicacion>((resolver) => {
        completar = resolver;
      }),
  );
  const { result } = await renderHook(() =>
    useUbicacionCercana(TERMINALES, () => undefined),
  );

  let solicitud: Promise<void> | undefined;
  await act(async () => {
    solicitud = result.current.resolver();
    await Promise.resolve();
  });
  expect(result.current.estado).toEqual({ tipo: 'esperando' });
  await act(async () => {
    completar({ estado: 'denegado' });
    await solicitud;
  });
});

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

it('presenta los servicios desactivados como estado propio', async () => {
  jest
    .mocked(obtenerUbicacionActual)
    .mockResolvedValue({ estado: 'desactivado' });
  const { result } = await renderHook(() =>
    useUbicacionCercana(TERMINALES, () => undefined),
  );

  await act(() => result.current.resolver());

  expect(result.current.estado).toEqual({ tipo: 'desactivada' });
});
