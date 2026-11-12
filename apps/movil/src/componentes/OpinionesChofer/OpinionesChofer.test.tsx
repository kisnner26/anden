import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, describe, expect, it } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { ContextoBoletos, type ValorBoletos } from '@/datos/useBoletos';
import { obtenerMuestra, reiniciarMuestra } from '@/datos/useSalidas';
import { renderPantalla } from '@/pruebas/render';

import { OpinionesChofer } from './OpinionesChofer';

afterEach(async () => {
  await AsyncStorage.clear();
  reiniciarMuestra();
});

/** un viaje de muestra que ya salió y un boleto que no está cancelado en él */
function conBoletoDeViajePasado() {
  const viaje = obtenerMuestra().viajes.find(
    (candidato) => new Date(candidato.salida).getTime() <= Date.now(),
  );
  if (!viaje) throw new Error('la muestra no trae un viaje que ya salió');
  const valor = {
    boletos: [
      {
        boleto: { estado: 'vigente', id: 'bol_1', viajeId: viaje.id },
        resumen: {},
      },
    ],
    cancelar: async () => undefined,
    cargando: false,
    reservar: async () => ({ error: 'viaje-inexistente', ok: false }),
    validar: async () => undefined,
  } as unknown as ValorBoletos;
  return {
    choferId: viaje.choferId,
    envolver: (hijos: React.ReactNode) => (
      <ContextoBoletos.Provider value={valor}>{hijos}</ContextoBoletos.Provider>
    ),
  };
}

describe('OpinionesChofer', () => {
  it('avisa si todavía no hay comentarios', async () => {
    const pantalla = await renderPantalla(<OpinionesChofer choferId="cho_1" />);
    expect(pantalla.getByText(/Todavía nadie dejó un comentario/)).toBeTruthy();
  });

  it('explica que se opina con un boleto de un viaje ya hecho', async () => {
    const pantalla = await renderPantalla(<OpinionesChofer choferId="cho_1" />);
    expect(
      pantalla.getByText(/Podés opinar cuando termine un viaje/),
    ).toBeTruthy();
    expect(
      pantalla.queryByRole('button', { name: 'Enviar opinión' }),
    ).toBeNull();
  });

  it('pide estrellas antes de enviar', async () => {
    const { choferId, envolver } = conBoletoDeViajePasado();
    const pantalla = await renderPantalla(
      envolver(<OpinionesChofer choferId={choferId} />),
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Enviar opinión' }),
    );
    expect(pantalla.getByText('Elegí de 1 a 5 estrellas.')).toBeTruthy();
  });

  it('guarda la opinión, la marca como de un viaje hecho y no deja repetir', async () => {
    const { choferId, envolver } = conBoletoDeViajePasado();
    const pantalla = await renderPantalla(
      envolver(<OpinionesChofer choferId={choferId} />),
    );
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
    expect(pantalla.getByText('Viajó con este chofer')).toBeTruthy();
    expect(
      pantalla.queryByRole('button', { name: 'Enviar opinión' }),
    ).toBeNull();
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
