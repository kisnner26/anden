import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { EnlaceTerminal } from './EnlaceTerminal';

const mockAbrir = jest.fn<(lugar: object) => Promise<boolean>>();

jest.mock('@/datos/mapas', () => ({
  abrirIndicacionesAppleMaps: (lugar: object) => mockAbrir(lugar),
}));

const MAYOREO = {
  coordenadas: { lat: 12.13413, lng: -86.1933 },
  nombre: 'Mercado Mayoreo',
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('EnlaceTerminal', () => {
  it('muestra la terminal y se anuncia con su ayuda', async () => {
    const pantalla = await renderPantalla(
      <EnlaceTerminal terminal={MAYOREO} />,
    );
    expect(pantalla.getAllByText('Mercado Mayoreo').length).toBeGreaterThan(0);
    const enlace = pantalla.getByRole('link', {
      name: 'Cómo llegar, Mercado Mayoreo',
    });
    expect(enlace.props.accessibilityHint).toBe(
      'Abre Apple Maps con indicaciones hacia Mercado Mayoreo',
    );
  });

  it('abre Apple Maps con la terminal al presionar', async () => {
    mockAbrir.mockResolvedValueOnce(true);
    const pantalla = await renderPantalla(
      <EnlaceTerminal terminal={MAYOREO} />,
    );
    await fireEvent.press(pantalla.getByRole('link'));
    expect(mockAbrir).toHaveBeenCalledWith(MAYOREO);
    expect(pantalla.queryByText('No pudimos abrir Apple Maps.')).toBeNull();
  });

  it('avisa si el sistema no pudo abrir Apple Maps', async () => {
    mockAbrir.mockResolvedValueOnce(false);
    const pantalla = await renderPantalla(
      <EnlaceTerminal terminal={MAYOREO} />,
    );
    await fireEvent.press(pantalla.getByRole('link'));
    await waitFor(() =>
      expect(pantalla.getByText('No pudimos abrir Apple Maps.')).toBeTruthy(),
    );
  });
});
