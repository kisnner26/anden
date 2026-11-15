import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@/datos/useBrujula', () => ({ useBrujula: jest.fn() }));

import { useBrujula } from '@/datos/useBrujula';
import { renderPantalla } from '@/pruebas/render';

import { BrujulaAlPunto } from './BrujulaAlPunto';

const AQUI = { lat: 12.13413, lng: -86.1933 };
const PUNTO = { lat: AQUI.lat + 0.003, lng: AQUI.lng };

function dibujar() {
  return renderPantalla(
    <BrujulaAlPunto abierta alCerrar={() => undefined} punto={PUNTO} />,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('BrujulaAlPunto', () => {
  it('mientras busca la ubicación lo dice', async () => {
    jest.mocked(useBrujula).mockReturnValue({
      estado: 'cargando',
      haciaDondeMira: null,
      posicion: null,
    });
    const p = await dibujar();
    expect(p.getAllByText('Buscando tu ubicación…').length).toBeGreaterThan(0);
  });

  it('sin permiso explica cómo darlo', async () => {
    jest.mocked(useBrujula).mockReturnValue({
      estado: 'sin-permiso',
      haciaDondeMira: null,
      posicion: null,
    });
    const p = await dibujar();
    expect(p.getAllByText(/Dame el permiso en Ajustes/).length).toBeGreaterThan(
      0,
    );
  });

  it('con ubicación y rumbo dice cuánto falta', async () => {
    jest.mocked(useBrujula).mockReturnValue({
      estado: 'listo',
      haciaDondeMira: 0,
      posicion: AQUI,
    });
    const p = await dibujar();
    expect(p.getAllByText(/^Faltan \d+ m$/).length).toBeGreaterThan(0);
  });

  it('a pocos metros dice que llegaste', async () => {
    jest.mocked(useBrujula).mockReturnValue({
      estado: 'listo',
      haciaDondeMira: 0,
      posicion: { lat: PUNTO.lat - 0.00005, lng: PUNTO.lng },
    });
    const p = await dibujar();
    expect(
      p.getAllByText('Llegaste. Acá se sube al bus.').length,
    ).toBeGreaterThan(0);
  });

  it('con posición pero sin rumbo pide calibrar', async () => {
    jest.mocked(useBrujula).mockReturnValue({
      estado: 'listo',
      haciaDondeMira: null,
      posicion: AQUI,
    });
    const p = await dibujar();
    expect(p.getAllByText(/calibrar/).length).toBeGreaterThan(0);
  });
});
