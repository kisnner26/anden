import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';

import { useMovimientoReducido } from '@/tema/useMovimientoReducido';

import { EsqueletoIA } from './EsqueletoIA';

jest.mock('@/tema/useMovimientoReducido', () => ({
  useMovimientoReducido: jest.fn(() => false),
}));

beforeEach(() => {
  jest.mocked(useMovimientoReducido).mockReturnValue(false);
});

describe('EsqueletoIA', () => {
  it('se dibuja mientras llega la respuesta', async () => {
    const pantalla = await render(<EsqueletoIA />);
    expect(pantalla.toJSON()).not.toBeNull();
  });

  it('no se lee en voz alta porque es solo decoración', async () => {
    const pantalla = await render(<EsqueletoIA />);
    expect(JSON.stringify(pantalla.toJSON())).toContain(
      '"accessibilityElementsHidden":true',
    );
  });

  it('dibuja tres líneas por defecto', async () => {
    const pantalla = await render(<EsqueletoIA />);
    const caja = pantalla.toJSON() as { children: unknown[] };
    expect(caja.children).toHaveLength(3);
  });

  it('dibuja las líneas que se pidan', async () => {
    const pantalla = await render(<EsqueletoIA lineas={5} />);
    const caja = pantalla.toJSON() as { children: unknown[] };
    expect(caja.children).toHaveLength(5);
  });

  it('con movimiento reducido sigue mostrando las líneas', async () => {
    jest.mocked(useMovimientoReducido).mockReturnValue(true);
    const pantalla = await render(<EsqueletoIA />);
    expect(pantalla.toJSON()).not.toBeNull();
  });
});
