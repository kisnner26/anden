import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { reiniciarMuestra } from '@/datos/useSalidas';
import { renderPantalla } from '@/pruebas/render';

import { DondeViene } from './DondeViene';

// las salidas de muestra dependen de la hora; se fija media tarde
beforeEach(() => {
  jest.useFakeTimers({
    advanceTimers: true,
    now: new Date(2026, 10, 12, 14, 0),
  });
});

afterEach(() => {
  reiniciarMuestra();
  jest.useRealTimers();
});

function dibujar(propiedades: Partial<Parameters<typeof DondeViene>[0]> = {}) {
  return renderPantalla(
    <DondeViene alVolver={() => undefined} {...propiedades} />,
  );
}

describe('DondeViene', () => {
  it('pide elegir dónde está y empieza en Managua', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('Estoy en')).toBeTruthy();
    expect(
      pantalla.getByRole('tab', { name: 'Managua' }).props.accessibilityState,
    ).toMatchObject({ selected: true });
    expect(pantalla.getByText('Mercado Mayoreo')).toBeTruthy();
  });

  it('desde Mayoreo muestra los buses que vienen de Boaco y de Juigalpa', async () => {
    const pantalla = await dibujar();
    expect(
      pantalla.getAllByText(/Sale de (Boaco|Juigalpa) en \d+ min/).length,
    ).toBeGreaterThan(0);
    expect(pantalla.getAllByText('Estás acá').length).toBeGreaterThan(0);
  });

  it('desde Boaco muestra el bus que ya viene en camino, con kilómetros y hora de salida', async () => {
    const pantalla = await dibujar({ ciudadInicial: 'Boaco' });
    expect(pantalla.getByText(/^a \d+ km de Boaco/)).toBeTruthy();
    expect(pantalla.getByText(/Salió de Managua a las/)).toBeTruthy();
  });

  it('dice siempre de dónde sale el dato y que la llegada es una estimación', async () => {
    const pantalla = await dibujar({ ciudadInicial: 'Boaco' });
    expect(pantalla.getAllByText('Según horario').length).toBeGreaterThan(0);
    expect(pantalla.getAllByText('Llegada (ETA)').length).toBeGreaterThan(0);
    expect(pantalla.getByText('Cómo se calcula')).toBeTruthy();
  });

  it('cambiar de terminal cambia los buses', async () => {
    const pantalla = await dibujar();
    await fireEvent.press(pantalla.getByRole('tab', { name: 'Boaco' }));
    expect(pantalla.getByText('Terminal de Buses de Boaco')).toBeTruthy();
    expect(pantalla.getByText(/^a \d+ km de Boaco/)).toBeTruthy();
  });

  it('abre el viaje del bus elegido', async () => {
    const alAbrirViaje = jest.fn();
    const pantalla = await dibujar({ alAbrirViaje, ciudadInicial: 'Boaco' });
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Ver el viaje' }),
    );
    expect(alAbrirViaje.mock.calls[0]?.[0]).toMatch(/^via_/);
  });
});
