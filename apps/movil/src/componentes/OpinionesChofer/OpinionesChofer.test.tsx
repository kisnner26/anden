import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, describe, expect, it } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { OpinionesChofer } from './OpinionesChofer';

afterEach(async () => {
  await AsyncStorage.clear();
});

describe('OpinionesChofer', () => {
  it('avisa si todavía no hay comentarios', async () => {
    const pantalla = await renderPantalla(<OpinionesChofer choferId="cho_1" />);
    expect(pantalla.getByText(/Todavía nadie dejó un comentario/)).toBeTruthy();
  });

  it('pide estrellas antes de enviar', async () => {
    const pantalla = await renderPantalla(<OpinionesChofer choferId="cho_1" />);
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Enviar opinión' }),
    );
    expect(pantalla.getByText('Elegí de 1 a 5 estrellas.')).toBeTruthy();
  });

  it('guarda la opinión y la muestra', async () => {
    const pantalla = await renderPantalla(<OpinionesChofer choferId="cho_1" />);
    await fireEvent.press(
      pantalla.getByRole('button', { name: '4 estrellas' }),
    );
    await fireEvent.changeText(
      pantalla.getByLabelText('Comentario (opcional)'),
      'Llegó a tiempo',
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Enviar opinión' }),
    );
    await waitFor(() =>
      expect(pantalla.getByText('Llegó a tiempo')).toBeTruthy(),
    );
    expect(pantalla.getByText(/quedó guardada/)).toBeTruthy();
  });

  it('guarda un reporte con su motivo', async () => {
    const pantalla = await renderPantalla(<OpinionesChofer choferId="cho_1" />);
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Reportar a este chofer' }),
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Maltrato' }));
    await waitFor(() =>
      expect(pantalla.getByText(/Reporte guardado/)).toBeTruthy(),
    );
  });
});
