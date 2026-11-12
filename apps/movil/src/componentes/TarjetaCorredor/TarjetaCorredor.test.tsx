import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, beforeEach, expect, it, jest } from '@jest/globals';
import { act, fireEvent } from '@testing-library/react-native';

import { ProveedorFavoritos } from '@/datos/ProveedorFavoritos';
import { reiniciarMuestra } from '@/datos/useSalidas';
import { renderPantalla } from '@/pruebas/render';

import { TarjetaCorredor } from './TarjetaCorredor';

const BOACO_MANAGUA = {
  destino: 'Managua',
  id: 'cor_boa_man',
  origen: 'Boaco',
} as const;

beforeEach(async () => {
  await AsyncStorage.clear();
  reiniciarMuestra();
});

afterEach(() => {
  jest.useRealTimers();
  reiniciarMuestra();
});

it('explica el corredor y abre su detalle', async () => {
  const alPresionar = jest.fn();
  const pantalla = await renderPantalla(
    <TarjetaCorredor alPresionar={alPresionar} corredor={BOACO_MANAGUA} />,
  );

  const tarjeta = pantalla.getByRole('button', {
    name: 'Abrir Boaco a Managua',
  });
  expect(tarjeta.props.accessibilityHint).toBe(
    'Horarios y ubicación por confirmar',
  );
  expect(pantalla.getByText('Boaco')).toBeTruthy();
  expect(pantalla.getByText('Managua')).toBeTruthy();
  expect(pantalla.getByText('Operación de muestra')).toBeTruthy();
  await fireEvent.press(tarjeta);
  expect(alPresionar).toHaveBeenCalledWith('cor_boa_man');
});

it('muestra cuándo sale la próxima unidad y cuántos asientos quedan', async () => {
  const pantalla = await renderPantalla(
    <TarjetaCorredor alPresionar={() => undefined} corredor={BOACO_MANAGUA} />,
  );

  expect(pantalla.getByText(/^Sale en \d+ min$/)).toBeTruthy();
  expect(
    pantalla.getByText(/asientos libres|Pocos asientos|Agotado/),
  ).toBeTruthy();
  expect(pantalla.queryByText('Sin servicio anunciado')).toBeNull();
});

it('explica cuando ya no quedan salidas', async () => {
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
  const pantalla = await renderPantalla(
    <TarjetaCorredor alPresionar={() => undefined} corredor={BOACO_MANAGUA} />,
  );
  await act(async () => {
    jest.setSystemTime(new Date(Date.now() + 6 * 3_600_000));
    jest.advanceTimersByTime(60_000);
  });

  expect(pantalla.getByText('Sin servicio anunciado')).toBeTruthy();
});

it('marca y quita la ruta como favorita', async () => {
  const pantalla = await renderPantalla(
    <ProveedorFavoritos>
      <TarjetaCorredor alPresionar={() => undefined} corredor={BOACO_MANAGUA} />
    </ProveedorFavoritos>,
  );

  await fireEvent.press(
    pantalla.getByRole('button', {
      name: 'Marcar Boaco a Managua como favorita',
    }),
  );
  expect(
    await pantalla.findByRole('button', {
      name: 'Quitar Boaco a Managua de favoritas',
    }),
  ).toBeTruthy();
  expect(await AsyncStorage.getItem('anden.favoritos')).toBe('["cor_boa_man"]');
});
